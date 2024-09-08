import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import treeviz.MunicipalTree;
import treeviz.TreeInfo;
import treeviz.TreeReader;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TreeViewerTest {

    List<MunicipalTree> trees;

    @BeforeEach
    void getTrees(){
        try {
            String filename = "treelist.csv"; //change this accordingly
            this.trees = TreeReader.readTreesFromFile(filename);
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }
    }

    @Test
    void getTreeTypeTest() {
        final Set<String> types = TreeInfo.getTreeTypes(this.trees);
        assertEquals(184,types.size());
    }

    @Test
    void countTreeTest() {
        int count = TreeInfo.getTreeCount("BALSAM FIR", this.trees);
        assertEquals(37,count);
    }



}
