package decorator;

import trees.MunicipalTree;

/**
 * Class RibbonDecorator
 */
public class RibbonDecorator extends TreeDecorator {
    private String colour;

    public RibbonDecorator(MunicipalTree decoratedTree, String colour) {
        super(decoratedTree);
        this.colour = colour;
    }

    @Override
    public String getDescription(){
        String description = hack(decoratedTree.getDescription());
        return description + " I am wrapped with a " + colour + " ribbon.";
    }
}

