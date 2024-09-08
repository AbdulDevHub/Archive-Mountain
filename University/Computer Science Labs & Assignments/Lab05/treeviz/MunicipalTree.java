package treeviz;

/**
 * This datatype represents a municipal tree.
 */
public class MunicipalTree {

    private final String type;
    private final String owner;
    private final long diameter;
    private final String name;
    private final Location loc;

    /**
     * Make a Municipal Tree
     *
     * @param record
     *            list of Strings that parameterize a tree. The parameters in the list are as follows:
     *            record[0] is its type (e.g. deciduous or coniferous)
     *            record[1] is its diameter in cm
     *            record[2] is its owner (e.g. Peel, Mississauga)
     *            record[3] is its botanical name
     *            record[4] and record[5] are the longitude and latitude coords of its location
     */
    public MunicipalTree(String[] record) {
        this.type = record[0];
        this.diameter = Integer.parseInt(record[1]);
        this.owner = record[2];
        this.name = record[3];
        this.loc = new Location(Float.parseFloat(record[4]), Float.parseFloat(record[5]));
    }

    /**
     * Getter
     *
     * @return  type of tree
     */
    public String getType() {
        return type;
    }

    /**
     * Getter
     *
     * @return  owner of tree
     */
    public String getOwner() {
        return owner;
    }

    /**
     * Getter
     *
     * @return  diameter of tree
     */
    public long getDiameter() {
        return diameter;
    }

    /**
     * Getter
     *
     * @return  name of tree
     */
    public String getName() {
        return name;
    }

    /**
     * Getter
     *
     * @return  Location of tree
     */
    public Location getLoc() {
        return loc;
    }

    /*
     * @see Object.toString()
     */
    @Override public String toString() {
        return "(" + this.getType()
                + ", " + this.getName()
                + ", " + this.getLoc()
                + ") " + this.getDiameter();
    }

    /*
     * @see Object.equals()
     */
    @Override public boolean equals(Object thatObject) {
        if (!(thatObject instanceof MunicipalTree)) {
            return false;
        }

        MunicipalTree that = (MunicipalTree) thatObject;
        return this.loc == that.loc;
    }

    /*
     * @see Object.hashCode()
     */
    @Override public int hashCode() {
        return (int) (7*this.loc.getLon() + 31*this.loc.getLat());
    }


}
