package br.umc.audit;

/**
 * Holder thread-local para propagar contexto de auditoria
 * entre camadas (controller → service) sem poluir assinaturas de método.
 */
public final class AuditContext {

    private static final ThreadLocal<String> IP_HOLDER = new ThreadLocal<>();
    private static final ThreadLocal<String> USUARIO_EMAIL_HOLDER = new ThreadLocal<>();
    private static final ThreadLocal<String> USUARIO_PERFIL_HOLDER = new ThreadLocal<>();

    private AuditContext() {
    }

    public static void setIp(String ip) {
        IP_HOLDER.set(ip);
    }

    public static String getIp() {
        return IP_HOLDER.get();
    }

    public static void setUsuarioEmail(String email) {
        USUARIO_EMAIL_HOLDER.set(email);
    }

    public static String getUsuarioEmail() {
        return USUARIO_EMAIL_HOLDER.get();
    }

    public static void setUsuarioPerfil(String perfil) {
        USUARIO_PERFIL_HOLDER.set(perfil);
    }

    public static String getUsuarioPerfil() {
        return USUARIO_PERFIL_HOLDER.get();
    }

    public static void clear() {
        IP_HOLDER.remove();
        USUARIO_EMAIL_HOLDER.remove();
        USUARIO_PERFIL_HOLDER.remove();
    }
}
