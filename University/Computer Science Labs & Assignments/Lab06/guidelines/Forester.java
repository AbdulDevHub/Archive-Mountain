package guidelines;

import guidelines.observer.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Forester class, an observer of guidelines
 */
public class Forester implements GuidelineObserver {

    //guidelines
    private HashMap<String, ArrayList<String>> treeGuidelines = new HashMap<String, ArrayList<String>>();

    /**
     * Receive notification from observable and update
     *
     * @param observerState Updated guidelines
     */
    @Override
    public void update(HashMap<String, ArrayList<String>> observerState) {
        this.treeGuidelines = observerState;
    }

    /**
     * Get guidelines related to a given tree name
     *
     * @param treeName Name of tree to be considered
     * @return  guidelines for given tree planting options
     */
    public List<String> getGuidelines(String treeName) {
        return this.treeGuidelines.get(treeName);
    }


}

