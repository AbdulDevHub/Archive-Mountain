package treeviz;

/**
 * Location class, to hold tree locations
 */
public class Location {

    private final float lat; //once initialized, these are fixed
    private final float lon;

    /**
     * Make a Location.
     * 
     * @param lat latitude
     * @param lon longitude
     */
    public Location(float lat, float lon) {
        this.lat = lat;
        this.lon = lon;
    }

    /**
     * Getter
     *
     * @return  latitude
     */
    public float getLat() {
        return lat;
    }

    /**
     * Getter
     *
     * @return  longitude
     */
    public float getLon() {
        return lon;
    }

    /**
     * Getter
     *
     * @return  array of doubles, containing longitude and longitude coordinates
     */
    public double[] getCoords() {
        return new double[]{this.lat, this.lon};
    }

    /*
     * @see Object.toString()
     */
    @Override public String toString() {
        return "[" + this.getLat()
                + ", " + this.getLon()
                + "]";
    }

    /*
     * @see Object.equals()
     */
    @Override public boolean equals(Object thatObject) {
        if (!(thatObject instanceof Location)) {
            return false;
        }

        Location that = (Location) thatObject;
        return this.lat == that.lat
                && this.lon == that.lon;
    }

    /*
     * @see Object.hashCode()
     */
    @Override public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + (int) this.lat;
        result = prime * result + (int) this.lon;
        return result;
    }


    /**
     * Tests is given lon, lat coordinate is within a given radius
     *
     * @param lat latitude
     * @param lon longitude
     * @param radius radius
     * @return true, if lat,lon coordinate is within radius
     */
    public boolean inBoundary(float lat, float lon, float radius) {
        return (this.getLat() - lat) * (this.getLat() - lat) + (this.getLon() - lon) * (this.getLon() - lon) < radius * radius;
    }


}
