package decorator;

import trees.MunicipalTree;
import trees.WhiteAsh;

/**
 * Class TreeDecorator
 */
public abstract class TreeDecorator implements MunicipalTree {
    protected MunicipalTree decoratedTree;
    protected String hope;

    public TreeDecorator(MunicipalTree decoratedTree){
        this.decoratedTree = decoratedTree;
        this.hope = "I’m a **DECORATED** " + decoratedTree.getDescription().substring(6);
    }

    @Override
    public String getDescription(){
        return hope;
    }

    public String hack(String pleaseWork){
        if (pleaseWork.contains("I'm a") && !pleaseWork.contains("DECORATED"))
        {
            String check = hope + pleaseWork.substring(pleaseWork.indexOf(".") + 1);
            return check;
        }
        return pleaseWork;
    }
}
