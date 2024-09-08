package lab03;

import java.util.Objects;

/**
 * A  White Ash is a tree that stores carbon.
 *  - A WhiteAsh has a diameter
 *  - A WhiteAsh may be alive or dead
 *  - A WhiteAsh has a default growth rate of 0.3 cm in diameter a year
 */
public class WhiteAsh implements Comparable<WhiteAsh>{

	private final double DEFAULT_RATE = 0.3;
	private double diameter;
	private boolean alive;

	/**
	 * Create an Ash with the given diameter. This new tree is, by default, alive.
	 *
	 * @param diameter	The diameter of this tree
	 */
	public WhiteAsh(double diameter) {
		this.diameter = diameter;
		this.alive = true;
	}

	/**
	 * Get the diameter of this tree
	 *
	 * @return	The diameter of this tree
	 */
	public double getDiameter() {
		return this.diameter;
	}

	/**
	 * Set the diameter of this tree
	 */
	private void setDiameter(double diameter) {
		this.diameter = diameter;
	}

	/**
	 * Return True if this tree is alive and false otherwise.
	 *
	 * @return	Whether or not this tree is alive
	 */
	public boolean getLiving() {
		return this.alive;
	}

	/**
	 * Set the tree to be alive or dead
	 */
	private void setLiving(boolean b) { this.alive = b; }

	/**
	 * Return string representation of this tree
	 *
	 * @return String	The string representation of this tree
	 */
	@Override
	public String toString() {
		String s = "Diameter: " + this.diameter +
				", Carbon content: " + this.carbonContent() + " kg";
		return s;
	}

	/**
	 * Increment the diameter of this tree based on the time (in years) that has elapsed
	 *  - If the tree is dead, do nothing
	 *  - If the time elapsed is less than 0, do nothing
	 *
	 * @param years  The number of years that have elapsed
	 */
	public void grow(double years) {
		if (years >= 0 && getLiving()){
			setDiameter(getDiameter() + DEFAULT_RATE * years);
		}
	}

	/**
	 * Calculate the carbon content of this tree in kg, based on biomass
	 * Carbon content of a White Ash can be calculated using this formula:
	 * Carbon = a*B, where B is the tree's Biomass and a = 0.521
	 * The tree's Biomass can be calculated using this formula:
	 * B = p*diameter^q, where diameter is the tree diameter, p = 0.16 and = 2.35
	 * Coefficients from:
	 * https://d32ogoqmya1dw8.cloudfront.net/files/eslabs/carbon/allometric_coefficients_common.v3.pdf
	 *
	 * @return double  The kg of carbon sequestered in the wood of the tree
	 */
	public double carbonContent() {
		return 0.521 * 0.16 * Math.pow(getDiameter(), 2.35);
	}

	/**
	 * Fell the tree. To fell (or chop down) the tree:
	 * - Sets the diameter to zero
	 * - Set the living status to 'false'.
	 */
	public void fellTree() {
		setDiameter(0);
		setLiving(false);
	}

	/**
	 * Assess if two trees are equal. Two trees are equal if:
	 * - They have the same diameter
	 * - They are both alive or both dead
	 *
	 * @param  other the WhiteAsh object
	 * @return boolean True if the trees are equal
	 */
	@Override
	public boolean equals(Object other) {
		if (this.getLiving() == ((WhiteAsh)other).getLiving() && this.getDiameter() == ((WhiteAsh)other).getDiameter()){
			return true;
		} return false;
	}

	/**
	 * Generate a unique hashCode for this tree.
	 *
	 * @return int	A hash code that is unique to all "equal" trees
	 */
	@Override
	public int hashCode() {
		return Objects.hash(DEFAULT_RATE, getDiameter(), getLiving());
	}

	/**
	 * Compare this tree to another.
	 * - If one tree is alive and the other dead, the living tree is "greater" than the dead one
	 * - If both are alive or dead, the one with the larger diameter is "greater"
	 * - If the trees are equal, return 0.
	 *
	 * @return int	0,1 or -1 (meaning same, greater than or less than, respectively)
	 */
	@Override
	public int compareTo(WhiteAsh other) {
		if(this.getLiving() && other.getLiving() == false){return 1;}
		else if(other.getLiving() && this.getLiving() == false){return -1;}

		else if(this.getDiameter() > other.getDiameter()){return 1;}
		else if(this.getDiameter() < other.getDiameter()){return -1;}

		return 0;
	}

}
