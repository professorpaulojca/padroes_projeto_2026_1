package br.umc.models.valueObjects;

import java.util.Objects;

public class Geolocalizacao {

    private final Double latitude;
    private final Double longitude;

    public Geolocalizacao(Double latitude, Double longitude) {
        if (latitude != null && (latitude < -90.0 || latitude > 90.0)) {
            throw new IllegalArgumentException("Latitude deve estar entre -90 e 90");
        }
        if (longitude != null && (longitude < -180.0 || longitude > 180.0)) {
            throw new IllegalArgumentException("Longitude deve estar entre -180 e 180");
        }
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public boolean isPresente() {
        return latitude != null && longitude != null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Geolocalizacao that = (Geolocalizacao) o;
        return Objects.equals(latitude, that.latitude) &&
                Objects.equals(longitude, that.longitude);
    }

    @Override
    public int hashCode() {
        return Objects.hash(latitude, longitude);
    }

    @Override
    public String toString() {
        if (!isPresente()) return "Geolocalizacao{indisponível}";
        return "Geolocalizacao{latitude=" + latitude + ", longitude=" + longitude + "}";
    }
}
