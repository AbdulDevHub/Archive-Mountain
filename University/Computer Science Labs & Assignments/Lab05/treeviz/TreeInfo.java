package treeviz;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * TreeInfo consists of methods to extract information from collections of municipal trees.
 */
public class TreeInfo {

    /**
     * Get all Botanical Names in a list of municipal trees.
     *
     * @return the Set of Botanical Names represented in the list of trees.
     *         Botanical Names are case-insensitive, and the returned set will
     *         include a Botanical Name at most once.
     */
    public static Set<String> getTreeTypes(List<MunicipalTree> trees) {
        Set<String> treeNames = new HashSet<String>();
        for (int i = 0; i < trees.size(); i++){treeNames.add(trees.get(i).getName());}
        return treeNames;
    }

    /**
     * Get a count of all the trees of a particular type in the list of trees
     *
     * @return the count of trees of a particular type
     */
    public static int getTreeCount(String treeType, List<MunicipalTree> trees) {
        int count = 0;
        for (int i = 0; i < trees.size(); i++){
            if (trees.get(i).getName().equals(treeType)) {count++;}
        }
        return count;
    }

}
