package decorator;

import trees.MunicipalTree;
import trees.NorwayMaple;

/**
 * Class BenchDecorator
 */
public class BenchDecorator extends TreeDecorator {

    public BenchDecorator(MunicipalTree decoratedTree) {
        super(decoratedTree);
    }

    @Override
    public String getDescription() {
        String description = hack(decoratedTree.getDescription());
        return description + " There is a bench beneath me.";
    }
}
