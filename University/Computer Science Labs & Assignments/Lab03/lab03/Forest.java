package lab03;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Forest class.  A forest contains an array of WhiteAsh trees.
 **/
public class Forest {

    private ArrayList<WhiteAsh> forest;
    private final int DEFAULT_DIAMETER = 12; //Average diameter of an ash tree in Mississauga

    /**
     * Create a Forest with nTrees in it.
     * Each tree should have the DEFAULT_DIAMETER
     *
     * @param nTrees	The number of trees in the forest
     */
    public Forest(int nTrees) {
        this.forest = new ArrayList<WhiteAsh>(nTrees);
        for (int i = 0; i < nTrees; i++) {
            forest.add(new WhiteAsh(DEFAULT_DIAMETER));
        }
    }

    /**
     * Create a Forest with nTrees in it, but allow randomization of their diameters.
     * If randomize is true, each tree will be assigned a diameter between
     * the given diameter and one 10 cm larger.
     * Otherwise, all trees will have the diameter provided.
     *
     * @param nTrees	The number of trees in the forest
     * @param diameter	The base diameter of the trees
     * @param randomize If diameters are randomized around the base.
     */
    public Forest(int nTrees, int diameter, boolean randomize) {
        this.forest = new ArrayList<WhiteAsh>(nTrees);
        for (int i = 0; i < nTrees; i++) {
            int base = diameter;
            if (randomize) base += (int)(Math.random()*10);
            forest.add(new WhiteAsh(base));
        }
    }

    /**
     * Add a tree to the array of trees in the forest
     *
     * @param m	The tree to add
     */
    public void addTree(WhiteAsh m) {
        forest.add(m);
    }

    /**
     * Calculate the percentage of trees in the forest that remain living
     *
     * @return double	Number between 0 and 100, the percent of living trees in the forest.
     */
    public double forestRemaining() {
        List<WhiteAsh> filtered = forest.stream()
                .filter(t -> t.getLiving() == true)
                .collect(Collectors.toList());
        return (double)filtered.size()/forest.size()*100;
    }

    /**
     * Calculate the total carbon content of the forest
     *
     * @return double	The carbon content, in kg, in all the wood of the forest
     */
    public double currCarbonContent() {
        double total = 0;
        for (int i = 0; i < forest.size(); i++) {
            total += forest.get(i).carbonContent();
        } return total;
    }

    public ArrayList<WhiteAsh> getForest() {return forest;}

    /**
     * Harvest trees in the forest that are "larger than" or "equal to" a given target tree.
     *
     * @param target	The tree that is to be compared to all other trees in the forest.
     */
    public void harvest(WhiteAsh target) {
        for (int i = 0; i < forest.size(); i++){
            if(target.compareTo(forest.get(i)) <= 0){
                forest.get(i).fellTree();
            }
        }
    }


}
