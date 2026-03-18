# Provisionamento AWS — PoC Gestão de Pessoas
### Spring Boot 3.2 + React 19 + PostgreSQL | Free Tier | AWS CLI

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Ambiente CLI](#2-configuração-do-ambiente-cli)
3. [Variáveis Globais](#3-variáveis-globais)
4. [IAM — Roles e Políticas](#4-iam--roles-e-políticas)
5. [VPC, Subnets e Security Groups](#5-vpc-subnets-e-security-groups)
6. [S3 — Hospedagem do Frontend (React SPA)](#6-s3--hospedagem-do-frontend-react-spa)
7. [CloudFront — CDN para o Frontend](#7-cloudfront--cdn-para-o-frontend)
8. [ECR — Registry do Container Spring Boot](#8-ecr--registry-do-container-spring-boot)
9. [Secrets Manager — Credenciais do Banco](#9-secrets-manager--credenciais-do-banco)
10. [RDS — PostgreSQL db.t3.micro](#10-rds--postgresql-dbt3micro)
11. [CloudWatch — Logs e Monitoramento](#11-cloudwatch--logs-e-monitoramento)
12. [ALB — Application Load Balancer](#12-alb--application-load-balancer)
13. [ECS Fargate — Cluster, Task e Service](#13-ecs-fargate--cluster-task-e-service)
14. [Route 53 — DNS (Opcional)](#14-route-53--dns-opcional)
15. [Verificação e Smoke Test](#15-verificação-e-smoke-test)
16. [Destruir a Stack (Cleanup)](#16-destruir-a-stack-cleanup)
17. [Limites do Free Tier](#17-limites-do-free-tier)

---

## 1. Pré-requisitos

### 1.1 Ferramentas necessárias

```bash
# Instalar AWS CLI v2 (Windows — PowerShell como Admin)
winget install -e --id Amazon.AWSCLI

# Verificar versão (exigido: >= 2.15)
aws --version
# aws-cli/2.x.x Python/3.x.x Windows/...

# Instalar Docker Desktop (para build da imagem)
winget install -e --id Docker.DockerDesktop

# Instalar jq (para parse de JSON nos outputs)
winget install -e --id jqlang.jq
```

### 1.2 Conta AWS

- Conta AWS com Free Tier ativo (< 12 meses ou elegível)
- Usuário IAM com permissões `AdministratorAccess` (só para provisionamento inicial)
- **Nunca use a conta root** para tarefas operacionais

---

## 2. Configuração do Ambiente CLI

```bash
# Configurar perfil nomeado (recomendado: nunca usar o default em projetos)
aws configure --profile poc-pessoas

# AWS Access Key ID [None]: AKIA...
# AWS Secret Access Key [None]: xxxxxxxx
# Default region name [None]: us-east-1
# Default output format [None]: json

# Verificar identidade antes de qualquer operação
aws sts get-caller-identity --profile poc-pessoas
# {
#   "UserId": "AIDA...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/seu-usuario"
# }

# Exportar profile para não repetir --profile em todo comando
$env:AWS_PROFILE = "poc-pessoas"
$env:AWS_DEFAULT_REGION = "us-east-1"
```

---

## 3. Variáveis Globais

> Defina estas variáveis no início de cada sessão PowerShell. Elas evitam erros de digitação e facilitam a reutilização.

```powershell
# ─── Identificadores do Projeto ────────────────────────────────────────────
$PROJECT      = "poc-pessoas"
$ENV          = "poc"                        # poc | dev | staging | prod
$REGION       = "us-east-1"
$ACCOUNT_ID   = $(aws sts get-caller-identity --query Account --output text)

# ─── Rede ──────────────────────────────────────────────────────────────────
$VPC_CIDR        = "10.0.0.0/16"
$SUBNET_PUB_CIDR = "10.0.1.0/24"
$SUBNET_APP_CIDR = "10.0.2.0/24"
$SUBNET_DB_CIDR  = "10.0.3.0/24"

# ─── Aplicação ─────────────────────────────────────────────────────────────
$APP_PORT        = "8080"
$APP_NAME        = "pessoas-api"
$CONTAINER_IMAGE = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$APP_NAME"

# ─── Banco de Dados ────────────────────────────────────────────────────────
$DB_NAME     = "pessoadb"
$DB_USER     = "dbadmin"
$DB_PASS     = "Poc@2026!Str0ng"     # Em produção use Secrets Manager no create
$DB_PORT     = "5432"
$DB_INSTANCE = "$PROJECT-postgres"

# ─── Tamanho das Instâncias (Free Tier) ────────────────────────────────────
$ECS_CPU    = "256"   # 0.25 vCPU
$ECS_MEM    = "512"   # 0.5 GB
$RDS_CLASS  = "db.t3.micro"

# ─── Tags padrão (aplicadas em todos os recursos) ──────────────────────────
$TAGS = "Key=Project,Value=$PROJECT Key=Environment,Value=$ENV Key=ManagedBy,Value=cli"
```

---

## 4. IAM — Roles e Políticas

> A task do ECS precisa de uma role para acessar ECR, CloudWatch e Secrets Manager.

```powershell
# ─── 4.1 Trust Policy para ECS Tasks ───────────────────────────────────────
$trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ecs-tasks.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
"@

$trustPolicy | Out-File -Encoding utf8 ecs-trust-policy.json

# ─── 4.2 Criar a Execution Role ────────────────────────────────────────────
aws iam create-role `
  --role-name "$PROJECT-ecs-execution-role" `
  --assume-role-policy-document file://ecs-trust-policy.json `
  --tags $TAGS

# ─── 4.3 Anexar políticas gerenciadas (mínimo necessário) ──────────────────

# Leitura de imagens ECR + push de logs CloudWatch (gerenciada pela AWS)
aws iam attach-role-policy `
  --role-name "$PROJECT-ecs-execution-role" `
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# ─── 4.4 Política inline para leitura do Secrets Manager ───────────────────
$secretPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ],
    "Resource": "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:$PROJECT/*"
  }]
}
"@

$secretPolicy | Out-File -Encoding utf8 secret-policy.json

aws iam put-role-policy `
  --role-name "$PROJECT-ecs-execution-role" `
  --policy-name "allow-secrets-read" `
  --policy-document file://secret-policy.json

# ─── 4.5 Capturar ARN da role (usado nas próximas etapas) ──────────────────
$EXECUTION_ROLE_ARN = $(aws iam get-role `
  --role-name "$PROJECT-ecs-execution-role" `
  --query "Role.Arn" --output text)

Write-Host "Execution Role ARN: $EXECUTION_ROLE_ARN"

# ─── Limpeza dos arquivos temporários ──────────────────────────────────────
Remove-Item ecs-trust-policy.json, secret-policy.json
```

---

## 5. VPC, Subnets e Security Groups

```powershell
# ─── 5.1 VPC ───────────────────────────────────────────────────────────────
$VPC_ID = $(aws ec2 create-vpc `
  --cidr-block $VPC_CIDR `
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$PROJECT-vpc},{Key=Project,Value=$PROJECT}]" `
  --query "Vpc.VpcId" --output text)

# Habilitar DNS hostname (necessário para o RDS e ECS resolverem nomes)
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support

Write-Host "VPC: $VPC_ID"

# ─── 5.2 Internet Gateway ──────────────────────────────────────────────────
$IGW_ID = $(aws ec2 create-internet-gateway `
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$PROJECT-igw},{Key=Project,Value=$PROJECT}]" `
  --query "InternetGateway.InternetGatewayId" --output text)

aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID

# ─── 5.3 Subnets ───────────────────────────────────────────────────────────
# Subnet pública (ALB)
$SUBNET_PUB_ID = $(aws ec2 create-subnet `
  --vpc-id $VPC_ID `
  --cidr-block $SUBNET_PUB_CIDR `
  --availability-zone "${REGION}a" `
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT-subnet-public},{Key=Project,Value=$PROJECT}]" `
  --query "Subnet.SubnetId" --output text)

# Atribuir IP público automaticamente (necessário para ALB em subnet pública)
aws ec2 modify-subnet-attribute --subnet-id $SUBNET_PUB_ID --map-public-ip-on-launch

# Subnet privada — App tier (ECS Tasks)
$SUBNET_APP_ID = $(aws ec2 create-subnet `
  --vpc-id $VPC_ID `
  --cidr-block $SUBNET_APP_CIDR `
  --availability-zone "${REGION}a" `
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT-subnet-app},{Key=Project,Value=$PROJECT}]" `
  --query "Subnet.SubnetId" --output text)

# Subnet privada — DB tier (RDS)
$SUBNET_DB_ID = $(aws ec2 create-subnet `
  --vpc-id $VPC_ID `
  --cidr-block $SUBNET_DB_CIDR `
  --availability-zone "${REGION}a" `
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT-subnet-db},{Key=Project,Value=$PROJECT}]" `
  --query "Subnet.SubnetId" --output text)

Write-Host "Subnets — Pub: $SUBNET_PUB_ID | App: $SUBNET_APP_ID | DB: $SUBNET_DB_ID"

# ─── 5.4 Route Table — Subnet Pública ──────────────────────────────────────
$RT_PUB_ID = $(aws ec2 create-route-table `
  --vpc-id $VPC_ID `
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$PROJECT-rt-public},{Key=Project,Value=$PROJECT}]" `
  --query "RouteTable.RouteTableId" --output text)

# Rota padrão para a internet
aws ec2 create-route `
  --route-table-id $RT_PUB_ID `
  --destination-cidr-block "0.0.0.0/0" `
  --gateway-id $IGW_ID

aws ec2 associate-route-table --route-table-id $RT_PUB_ID --subnet-id $SUBNET_PUB_ID

# ─── 5.5 NAT Gateway (Free Tier: use apenas se necessário para ECS pull ECR) ──
# ATENÇÃO: NAT Gateway custa ~$0.045/h — NÃO está no free tier.
# Alternativa gratuita: VPC Endpoints para ECR e Secrets Manager (abaixo).

# VPC Endpoint para ECR (evita NAT Gateway — gratuito para Interface Endpoint não, 
# mas ECR tem endpoint de Gateway para S3 que é GRATUITO)
aws ec2 create-vpc-endpoint `
  --vpc-id $VPC_ID `
  --service-name "com.amazonaws.$REGION.s3" `
  --route-table-ids $RT_PUB_ID `
  --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=$PROJECT-s3-endpoint}]"

# ─── 5.6 Security Groups ───────────────────────────────────────────────────
# SG do ALB — aceita tráfego da internet
$SG_ALB_ID = $(aws ec2 create-security-group `
  --group-name "$PROJECT-sg-alb" `
  --description "ALB: HTTP/HTTPS da internet" `
  --vpc-id $VPC_ID `
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$PROJECT-sg-alb},{Key=Project,Value=$PROJECT}]" `
  --query "GroupId" --output text)

aws ec2 authorize-security-group-ingress `
  --group-id $SG_ALB_ID `
  --protocol tcp --port 80 --cidr "0.0.0.0/0"

aws ec2 authorize-security-group-ingress `
  --group-id $SG_ALB_ID `
  --protocol tcp --port 443 --cidr "0.0.0.0/0"

# SG das ECS Tasks — aceita apenas do ALB
$SG_ECS_ID = $(aws ec2 create-security-group `
  --group-name "$PROJECT-sg-ecs" `
  --description "ECS Tasks: apenas do ALB na porta 8080" `
  --vpc-id $VPC_ID `
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$PROJECT-sg-ecs},{Key=Project,Value=$PROJECT}]" `
  --query "GroupId" --output text)

aws ec2 authorize-security-group-ingress `
  --group-id $SG_ECS_ID `
  --protocol tcp --port $APP_PORT `
  --source-group $SG_ALB_ID

# SG do RDS — aceita apenas das Tasks ECS
$SG_RDS_ID = $(aws ec2 create-security-group `
  --group-name "$PROJECT-sg-rds" `
  --description "RDS PostgreSQL: apenas do ECS na porta 5432" `
  --vpc-id $VPC_ID `
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$PROJECT-sg-rds},{Key=Project,Value=$PROJECT}]" `
  --query "GroupId" --output text)

aws ec2 authorize-security-group-ingress `
  --group-id $SG_RDS_ID `
  --protocol tcp --port $DB_PORT `
  --source-group $SG_ECS_ID

Write-Host "Security Groups — ALB: $SG_ALB_ID | ECS: $SG_ECS_ID | RDS: $SG_RDS_ID"
```

---

## 6. S3 — Hospedagem do Frontend (React SPA)

```powershell
# ─── 6.1 Criar bucket (nome deve ser globalmente único) ────────────────────
$S3_BUCKET = "$PROJECT-frontend-$ACCOUNT_ID"

aws s3api create-bucket `
  --bucket $S3_BUCKET `
  --region $REGION `
  --create-bucket-configuration LocationConstraint=$REGION

# ─── 6.2 Bloquear acesso público direto (acessado apenas via CloudFront) ───
aws s3api put-public-access-block `
  --bucket $S3_BUCKET `
  --public-access-block-configuration `
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# ─── 6.3 Habilitar versionamento (boa prática: rollback fácil) ─────────────
aws s3api put-bucket-versioning `
  --bucket $S3_BUCKET `
  --versioning-configuration Status=Enabled

# ─── 6.4 Tags ───────────────────────────────────────────────────────────────
aws s3api put-bucket-tagging `
  --bucket $S3_BUCKET `
  --tagging "TagSet=[{Key=Project,Value=$PROJECT},{Key=Environment,Value=$ENV}]"

# ─── 6.5 Build e deploy do frontend ────────────────────────────────────────
Set-Location ..\frontend

# Gerar o build de produção
npm run build

# Sincronizar para o S3 (apenas arquivos alterados)
aws s3 sync .\dist\ s3://$S3_BUCKET/ `
  --delete `
  --cache-control "max-age=31536000,immutable" `
  --exclude "index.html"

# index.html sem cache (sempre a versão mais recente)
aws s3 cp .\dist\index.html s3://$S3_BUCKET/index.html `
  --cache-control "no-cache,no-store,must-revalidate" `
  --content-type "text/html"

Set-Location ..\artefatos
Write-Host "S3 Bucket frontend: s3://$S3_BUCKET"
```

---

## 7. CloudFront — CDN para o Frontend

```powershell
# ─── 7.1 Origin Access Control (OAC) — substitui o OAI legado ──────────────
$OAC_ID = $(aws cloudfront create-origin-access-control `
  --origin-access-control-config @"
{
  "Name": "$PROJECT-oac",
  "Description": "OAC para S3 $S3_BUCKET",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
"@ --query "OriginAccessControl.Id" --output text)

# ─── 7.2 Criar distribuição CloudFront ─────────────────────────────────────
$CF_DIST_ID = $(aws cloudfront create-distribution `
  --distribution-config @"
{
  "CallerReference": "$PROJECT-$(Get-Date -Format yyyyMMddHHmmss)",
  "Comment": "PoC Pessoas — Frontend SPA",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "s3-origin",
      "DomainName": "$S3_BUCKET.s3.$REGION.amazonaws.com",
      "S3OriginConfig": { "OriginAccessIdentity": "" },
      "OriginAccessControlId": "$OAC_ID"
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true,
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 0
    }]
  },
  "PriceClass": "PriceClass_100",
  "Enabled": true
}
"@ --query "Distribution.Id" --output text)

# ─── 7.3 Domínio do CloudFront ─────────────────────────────────────────────
$CF_DOMAIN = $(aws cloudfront get-distribution `
  --id $CF_DIST_ID `
  --query "Distribution.DomainName" --output text)

Write-Host "CloudFront Domain: https://$CF_DOMAIN"

# ─── 7.4 Bucket policy — permitir apenas CloudFront (OAC) ──────────────────
$bucketPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$S3_BUCKET/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::$ACCOUNT_ID:distribution/$CF_DIST_ID"
      }
    }
  }]
}
"@

$bucketPolicy | Out-File -Encoding utf8 bucket-policy.json
aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://bucket-policy.json
Remove-Item bucket-policy.json
```

---

## 8. ECR — Registry do Container Spring Boot

```powershell
# ─── 8.1 Criar repositório ─────────────────────────────────────────────────
aws ecr create-repository `
  --repository-name $APP_NAME `
  --image-scanning-configuration scanOnPush=true `
  --encryption-configuration encryptionType=AES256 `
  --tags $TAGS

# ─── 8.2 Lifecycle policy — manter apenas as 3 últimas imagens (free tier) ─
aws ecr put-lifecycle-policy `
  --repository-name $APP_NAME `
  --lifecycle-policy-text @"
{
  "rules": [{
    "rulePriority": 1,
    "description": "Manter apenas 3 imagens",
    "selection": {
      "tagStatus": "any",
      "countType": "imageCountMoreThan",
      "countNumber": 3
    },
    "action": { "type": "expire" }
  }]
}
"@

# ─── 8.3 Build e push da imagem ────────────────────────────────────────────
Set-Location ..\backend

# Login no ECR
aws ecr get-login-password --region $REGION |
  docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Criar Dockerfile se não existir
if (-not (Test-Path Dockerfile)) {
  @"
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/software-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
LABEL maintainer="poc-pessoas" project="poc-pessoas" env="poc"
"@ | Out-File -Encoding utf8 Dockerfile
}

# Build Maven
./mvnw clean package -DskipTests

# Build Docker e push com tag semântica + latest
$IMAGE_TAG = "1.0.0"
docker build -t "${CONTAINER_IMAGE}:${IMAGE_TAG}" -t "${CONTAINER_IMAGE}:latest" .
docker push "${CONTAINER_IMAGE}:${IMAGE_TAG}"
docker push "${CONTAINER_IMAGE}:latest"

Set-Location ..\artefatos
Write-Host "Imagem publicada: ${CONTAINER_IMAGE}:${IMAGE_TAG}"
```

---

## 9. Secrets Manager — Credenciais do Banco

```powershell
# ─── 9.1 Criar secret com as credenciais do banco ──────────────────────────
# O valor é um JSON com todas as informações de conexão JDBC
$SECRET_ARN = $(aws secretsmanager create-secret `
  --name "$PROJECT/database" `
  --description "Credenciais RDS PostgreSQL para $PROJECT" `
  --secret-string @"
{
  "username": "$DB_USER",
  "password": "$DB_PASS",
  "dbname":   "$DB_NAME",
  "host":     "PLACEHOLDER_SUBSTITUIDO_APOS_RDS",
  "port":     "$DB_PORT",
  "engine":   "postgres"
}
"@ `
  --tags $TAGS `
  --query "ARN" --output text)

Write-Host "Secret ARN: $SECRET_ARN"
# ATENÇÃO: o host do RDS será atualizado na etapa 10 após criar a instância
```

---

## 10. RDS — PostgreSQL db.t3.micro

```powershell
# ─── 10.1 Subnet Group (RDS requer pelo menos 2 AZs — adicionamos uma segunda) ─
# Subnet adicional para o DB Subnet Group (AZ diferente — exigência do RDS)
$SUBNET_DB2_ID = $(aws ec2 create-subnet `
  --vpc-id $VPC_ID `
  --cidr-block "10.0.4.0/24" `
  --availability-zone "${REGION}b" `
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT-subnet-db-2b}]" `
  --query "Subnet.SubnetId" --output text)

aws rds create-db-subnet-group `
  --db-subnet-group-name "$PROJECT-db-subnet-group" `
  --db-subnet-group-description "Subnet group para $PROJECT RDS" `
  --subnet-ids $SUBNET_DB_ID $SUBNET_DB2_ID `
  --tags $TAGS

# ─── 10.2 Criar instância RDS PostgreSQL ───────────────────────────────────
aws rds create-db-instance `
  --db-instance-identifier $DB_INSTANCE `
  --db-instance-class $RDS_CLASS `
  --engine postgres `
  --engine-version "15.5" `
  --master-username $DB_USER `
  --master-user-password $DB_PASS `
  --db-name $DB_NAME `
  --allocated-storage 20 `
  --storage-type gp2 `
  --no-multi-az `
  --no-publicly-accessible `
  --vpc-security-group-ids $SG_RDS_ID `
  --db-subnet-group-name "$PROJECT-db-subnet-group" `
  --backup-retention-period 1 `
  --preferred-backup-window "03:00-04:00" `
  --preferred-maintenance-window "Mon:04:00-Mon:05:00" `
  --deletion-protection `
  --no-auto-minor-version-upgrade `
  --tags $TAGS

Write-Host "RDS criando... Aguarde 5-10 minutos."

# ─── 10.3 Aguardar a instância ficar disponível ────────────────────────────
aws rds wait db-instance-available --db-instance-identifier $DB_INSTANCE
Write-Host "RDS disponível!"

# ─── 10.4 Capturar o endpoint e atualizar o Secrets Manager ────────────────
$RDS_HOST = $(aws rds describe-db-instances `
  --db-instance-identifier $DB_INSTANCE `
  --query "DBInstances[0].Endpoint.Address" --output text)

Write-Host "RDS Host: $RDS_HOST"

# Atualizar o secret com o host real
aws secretsmanager update-secret `
  --secret-id "$PROJECT/database" `
  --secret-string @"
{
  "username": "$DB_USER",
  "password": "$DB_PASS",
  "dbname":   "$DB_NAME",
  "host":     "$RDS_HOST",
  "port":     "$DB_PORT",
  "engine":   "postgres"
}
"@

Write-Host "Secret atualizado com host do RDS."
```

---

## 11. CloudWatch — Logs e Monitoramento

```powershell
# ─── 11.1 Log Group para a aplicação Spring Boot ───────────────────────────
aws logs create-log-group `
  --log-group-name "/ecs/$PROJECT/$APP_NAME" `
  --tags "Project=$PROJECT,Environment=$ENV"

# Retenção de 7 dias (free tier tem 5 GB/mês incluso)
aws logs put-retention-policy `
  --log-group-name "/ecs/$PROJECT/$APP_NAME" `
  --retention-in-days 7

# ─── 11.2 Alarme de CPU alta no Fargate ────────────────────────────────────
aws cloudwatch put-metric-alarm `
  --alarm-name "$PROJECT-ecs-cpu-high" `
  --alarm-description "CPU ECS acima de 80% por 5 min" `
  --namespace "AWS/ECS" `
  --metric-name CPUUtilization `
  --dimensions Name=ClusterName,Value="$PROJECT-cluster" Name=ServiceName,Value="$PROJECT-service" `
  --statistic Average `
  --period 300 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold `
  --evaluation-periods 1 `
  --treat-missing-data notBreaching

# ─── 11.3 Alarme de conexões RDS ───────────────────────────────────────────
aws cloudwatch put-metric-alarm `
  --alarm-name "$PROJECT-rds-connections" `
  --alarm-description "DB Connections acima de 80" `
  --namespace "AWS/RDS" `
  --metric-name DatabaseConnections `
  --dimensions Name=DBInstanceIdentifier,Value=$DB_INSTANCE `
  --statistic Average `
  --period 300 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold `
  --evaluation-periods 1 `
  --treat-missing-data notBreaching
```

---

## 12. ALB — Application Load Balancer

```powershell
# ─── 12.1 Criar o ALB ──────────────────────────────────────────────────────
$ALB_ARN = $(aws elbv2 create-load-balancer `
  --name "$PROJECT-alb" `
  --subnets $SUBNET_PUB_ID `
  --security-groups $SG_ALB_ID `
  --scheme internet-facing `
  --type application `
  --ip-address-type ipv4 `
  --tags $TAGS `
  --query "LoadBalancers[0].LoadBalancerArn" --output text)

$ALB_DNS = $(aws elbv2 describe-load-balancers `
  --load-balancer-arns $ALB_ARN `
  --query "LoadBalancers[0].DNSName" --output text)

Write-Host "ALB DNS: $ALB_DNS"

# ─── 12.2 Target Group (aponta para as Tasks Fargate) ──────────────────────
$TG_ARN = $(aws elbv2 create-target-group `
  --name "$PROJECT-tg" `
  --protocol HTTP `
  --port $APP_PORT `
  --vpc-id $VPC_ID `
  --target-type ip `
  --health-check-path "/actuator/health" `
  --health-check-interval-seconds 30 `
  --health-check-timeout-seconds 5 `
  --healthy-threshold-count 2 `
  --unhealthy-threshold-count 3 `
  --tags $TAGS `
  --query "TargetGroups[0].TargetGroupArn" --output text)

# ─── 12.3 Listener HTTP :80 — redireciona para HTTPS ──────────────────────
aws elbv2 create-listener `
  --load-balancer-arn $ALB_ARN `
  --protocol HTTP `
  --port 80 `
  --default-actions @"
[{
  "Type": "redirect",
  "RedirectConfig": {
    "Protocol": "HTTPS",
    "Port": "443",
    "StatusCode": "HTTP_301"
  }
}]
"@

# ─── 12.4 Listener HTTPS :443 ─────────────────────────────────────────────
# NOTA: Para HTTPS, você precisa de um certificado ACM.
# Para PoC sem domínio, use HTTP :80 direto:
aws elbv2 create-listener `
  --load-balancer-arn $ALB_ARN `
  --protocol HTTP `
  --port 8080 `
  --default-actions @"
[{
  "Type": "forward",
  "TargetGroupArn": "$TG_ARN"
}]
"@

Write-Host "ALB ARN: $ALB_ARN"
Write-Host "Target Group ARN: $TG_ARN"
```

---

## 13. ECS Fargate — Cluster, Task e Service

```powershell
# ─── 13.1 Cluster ECS ──────────────────────────────────────────────────────
aws ecs create-cluster `
  --cluster-name "$PROJECT-cluster" `
  --capacity-providers FARGATE `
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 `
  --tags $TAGS

# ─── 13.2 Task Definition ──────────────────────────────────────────────────
$taskDef = @"
{
  "family": "$PROJECT-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "$ECS_CPU",
  "memory": "$ECS_MEM",
  "executionRoleArn": "$EXECUTION_ROLE_ARN",
  "taskRoleArn": "$EXECUTION_ROLE_ARN",
  "containerDefinitions": [{
    "name": "$APP_NAME",
    "image": "${CONTAINER_IMAGE}:latest",
    "essential": true,
    "portMappings": [{
      "containerPort": 8080,
      "protocol": "tcp"
    }],
    "environment": [
      { "name": "SPRING_PROFILES_ACTIVE", "value": "poc" },
      { "name": "SERVER_PORT",            "value": "8080" }
    ],
    "secrets": [
      { "name": "DB_HOST",     "valueFrom": "$SECRET_ARN:host::"     },
      { "name": "DB_PORT",     "valueFrom": "$SECRET_ARN:port::"     },
      { "name": "DB_NAME",     "valueFrom": "$SECRET_ARN:dbname::"   },
      { "name": "DB_USER",     "valueFrom": "$SECRET_ARN:username::" },
      { "name": "DB_PASSWORD", "valueFrom": "$SECRET_ARN:password::" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group":         "/ecs/$PROJECT/$APP_NAME",
        "awslogs-region":        "$REGION",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"],
      "interval": 30,
      "timeout": 5,
      "retries": 3,
      "startPeriod": 60
    },
    "stopTimeout": 30
  }],
  "tags": [
    { "key": "Project",     "value": "$PROJECT" },
    { "key": "Environment", "value": "$ENV"     }
  ]
}
"@

$taskDef | Out-File -Encoding utf8 task-definition.json

$TASK_DEF_ARN = $(aws ecs register-task-definition `
  --cli-input-json file://task-definition.json `
  --query "taskDefinition.taskDefinitionArn" --output text)

Remove-Item task-definition.json
Write-Host "Task Definition: $TASK_DEF_ARN"

# ─── 13.3 ECS Service ──────────────────────────────────────────────────────
aws ecs create-service `
  --cluster "$PROJECT-cluster" `
  --service-name "$PROJECT-service" `
  --task-definition $TASK_DEF_ARN `
  --desired-count 1 `
  --launch-type FARGATE `
  --network-configuration @"
{
  "awsvpcConfiguration": {
    "subnets": ["$SUBNET_APP_ID"],
    "securityGroups": ["$SG_ECS_ID"],
    "assignPublicIp": "DISABLED"
  }
}
"@ `
  --load-balancers @"
[{
  "targetGroupArn": "$TG_ARN",
  "containerName": "$APP_NAME",
  "containerPort": 8080
}]
"@ `
  --health-check-grace-period-seconds 120 `
  --scheduling-strategy REPLICA `
  --deployment-configuration @"
{
  "minimumHealthyPercent": 0,
  "maximumPercent": 100,
  "deploymentCircuitBreaker": {
    "enable": true,
    "rollback": true
  }
}
"@ `
  --tags $TAGS

Write-Host "Aguardando serviço estabilizar..."
aws ecs wait services-stable `
  --cluster "$PROJECT-cluster" `
  --services "$PROJECT-service"

Write-Host "Serviço ECS estável!"
```

---

## 14. Route 53 — DNS (Opcional)

> Requer um domínio registrado. Substitua `seudominio.com` pelo domínio real.

```powershell
# ─── 14.1 Criar Hosted Zone ────────────────────────────────────────────────
$HOSTED_ZONE_ID = $(aws route53 create-hosted-zone `
  --name "seudominio.com" `
  --caller-reference "$(Get-Date -Format yyyyMMddHHmmss)" `
  --query "HostedZone.Id" --output text)

# ─── 14.2 Record A (Alias) — api.seudominio.com → ALB ─────────────────────
$ALB_HOSTED_ZONE_ID = $(aws elbv2 describe-load-balancers `
  --load-balancer-arns $ALB_ARN `
  --query "LoadBalancers[0].CanonicalHostedZoneId" --output text)

aws route53 change-resource-record-sets `
  --hosted-zone-id $HOSTED_ZONE_ID `
  --change-batch @"
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "api.seudominio.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "$ALB_HOSTED_ZONE_ID",
        "DNSName": "$ALB_DNS",
        "EvaluateTargetHealth": true
      }
    }
  }]
}
"@

# ─── 14.3 Record CNAME — www.seudominio.com → CloudFront ──────────────────
aws route53 change-resource-record-sets `
  --hosted-zone-id $HOSTED_ZONE_ID `
  --change-batch @"
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "www.seudominio.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{ "Value": "$CF_DOMAIN" }]
    }
  }]
}
"@
```

---

## 15. Verificação e Smoke Test

```powershell
# ─── 15.1 Checar todos os recursos criados ────────────────────────────────
Write-Host "═══════════════════════════════════ RESUMO ══"
Write-Host "ALB URL (API):      http://$ALB_DNS:8080"
Write-Host "CloudFront (SPA):  https://$CF_DOMAIN"
Write-Host "RDS Host:          $RDS_HOST"
Write-Host "ECR Image:         ${CONTAINER_IMAGE}:latest"

# ─── 15.2 Smoke Test — Endpoints da API ──────────────────────────────────
$BASE_URL = "http://$ALB_DNS:8080"

# Health check (Spring Boot Actuator)
Invoke-RestMethod "$BASE_URL/actuator/health"

# Login
$loginBody = '{"usuario":"admin@email.com","senha":"123456"}'
Invoke-RestMethod -Method Post -Uri "$BASE_URL/login" `
  -ContentType "application/json" -Body $loginBody

# Listar pessoas
Invoke-RestMethod "$BASE_URL/api/pessoas"

# Swagger UI
Write-Host "Swagger: $BASE_URL/swagger-ui/index.html"

# ─── 15.3 Verificar logs da Task ─────────────────────────────────────────
$TASK_ARN = $(aws ecs list-tasks `
  --cluster "$PROJECT-cluster" `
  --service-name "$PROJECT-service" `
  --query "taskArns[0]" --output text)

aws logs tail "/ecs/$PROJECT/$APP_NAME" `
  --follow `
  --since 10m
```

---

## 16. Destruir a Stack (Cleanup)

> Execute na ordem inversa para evitar erros de dependência.

```powershell
# ─── ATENÇÃO: Este bloco destrói TODOS os recursos criados ─────────────────

# 1. Zerar o serviço ECS antes de deletar
aws ecs update-service `
  --cluster "$PROJECT-cluster" `
  --service "$PROJECT-service" `
  --desired-count 0

aws ecs delete-service `
  --cluster "$PROJECT-cluster" `
  --service "$PROJECT-service" `
  --force

# 2. Deletar o cluster ECS
aws ecs delete-cluster --cluster "$PROJECT-cluster"

# 3. Deletar o ALB e Target Group
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN
Start-Sleep -Seconds 10
aws elbv2 delete-target-group --target-group-arn $TG_ARN

# 4. Deletar RDS (remover proteção de deleção primeiro)
aws rds modify-db-instance `
  --db-instance-identifier $DB_INSTANCE `
  --no-deletion-protection `
  --apply-immediately

aws rds delete-db-instance `
  --db-instance-identifier $DB_INSTANCE `
  --skip-final-snapshot `
  --delete-automated-backups

aws rds wait db-instance-deleted --db-instance-identifier $DB_INSTANCE

aws rds delete-db-subnet-group --db-subnet-group-name "$PROJECT-db-subnet-group"

# 5. Deletar Secrets Manager
aws secretsmanager delete-secret `
  --secret-id "$PROJECT/database" `
  --force-delete-without-recovery

# 6. Esvaziar e deletar S3
aws s3 rm s3://$S3_BUCKET --recursive
aws s3api delete-bucket --bucket $S3_BUCKET --region $REGION

# 7. Deletar distribuição CloudFront (desabilitar primeiro)
aws cloudfront get-distribution-config --id $CF_DIST_ID `
  | ConvertFrom-Json | Select-Object -ExpandProperty DistributionConfig `
  | ForEach-Object { $_.Enabled = $false; $_ } `
  | ConvertTo-Json -Depth 20 | Out-File cf-disable.json

# (Simplificado — use o Console AWS ou CDK para CloudFront disable/delete em PoC)

# 8. Deletar repositório ECR
aws ecr delete-repository --repository-name $APP_NAME --force

# 9. Deletar Security Groups
aws ec2 delete-security-group --group-id $SG_RDS_ID
aws ec2 delete-security-group --group-id $SG_ECS_ID
aws ec2 delete-security-group --group-id $SG_ALB_ID

# 10. Deletar Subnets e Route Tables
foreach ($subnet in @($SUBNET_PUB_ID, $SUBNET_APP_ID, $SUBNET_DB_ID, $SUBNET_DB2_ID)) {
  aws ec2 delete-subnet --subnet-id $subnet
}
aws ec2 delete-route-table --route-table-id $RT_PUB_ID
aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID
aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID
aws ec2 delete-vpc --vpc-id $VPC_ID

# 11. Deletar IAM Role
aws iam detach-role-policy `
  --role-name "$PROJECT-ecs-execution-role" `
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam delete-role-policy `
  --role-name "$PROJECT-ecs-execution-role" `
  --policy-name "allow-secrets-read"

aws iam delete-role --role-name "$PROJECT-ecs-execution-role"

# 12. Deletar Log Group
aws logs delete-log-group --log-group-name "/ecs/$PROJECT/$APP_NAME"

Write-Host "Stack destruída com sucesso."
```

---

## 17. Limites do Free Tier

| Serviço | Free Tier | PoC Consome | Status |
|---|---|---|---|
| **EC2 / ECS Fargate** | 750h t2.micro/mês (EC2) | Fargate **NÃO** está no free tier | ⚠️ ~$2-5/mês |
| **RDS** | 750h db.t2.micro/mês | 1 instância db.t3.micro | ✅ Free 12 meses |
| **S3** | 5 GB / 20k GET / 2k PUT | Build React ~10 MB | ✅ Free |
| **CloudFront** | 1 TB transferência / 10M req | PoC baixo tráfego | ✅ Free |
| **ECR** | 500 MB/mês | Imagem Spring ~200 MB | ✅ Free |
| **Secrets Manager** | — | $0.40/secret/mês | ⚠️ $0.40/mês |
| **CloudWatch Logs** | 5 GB ingestão / 5 GB armazen. | PoC < 1 GB | ✅ Free |
| **ALB** | — | $0.008/h + LCU | ⚠️ ~$5/mês |
| **Route 53** | — | $0.50/hosted zone/mês | ⚠️ $0.50 (opcional) |

> **Custo estimado PoC completo:** ~$7-15 USD/mês (Fargate + ALB + Secrets Manager)  
> **Para custo zero:** substitua Fargate por EC2 t2.micro (Free Tier 12 meses) + Elastic IP gratuito.

---

### Referências

- [AWS CLI Command Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)
- [ECS Fargate Getting Started](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started-fargate.html)
- [RDS Free Tier](https://aws.amazon.com/rds/free/)
- [CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
