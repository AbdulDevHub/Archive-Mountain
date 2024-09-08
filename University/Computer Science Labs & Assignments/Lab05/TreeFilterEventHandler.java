import javafx.event.EventHandler;
import javafx.scene.control.ChoiceBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import javafx.scene.input.MouseEvent;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import treeviz.MunicipalTree;

/**
 * TreeFilterEventHandler handles UI events captured via the TreeViewer
 */
public class TreeFilterEventHandler implements EventHandler<MouseEvent> {

    private ChoiceBox treeSelect; //select box ref
    private TextField txtSummary; //summary of tree counts
    private TreeViewer treeView; //the tree view

    /**
     * Constructor
     * @param view reference to TreeView
     */
    public TreeFilterEventHandler(TreeViewer view) {
        this.treeView = view;
        this.treeSelect = view.getTreeSelect();
        this.txtSummary = view.getTxtSummary();
    }

    /**
     * Handle a mouse event (i.e. a button click)!  This routine will need to:
     * 1. Clear (or UNDO) all the circles from the existing view
     * 2. Cycle thru the list of trees and redraw circles that correspond to the tree type selected
     * 3. Remember to register any circles you draw on the "undo" stack, so they can be undone later!
     * 4. Remember also that if the user selects "ALL TREES", all the trees should be drawn
     *
     * @param event  The mouse event
     */
    @Override
    public void handle(MouseEvent event) {
        this.treeView.getAnchorRoot().getChildren().clear();
        this.treeView.getUndoStack().clear();
        this.txtSummary.setText("0");
        int counter = 0;
        for (int i = 0; i < this.treeView.getTrees().size(); i++) {
            Object selection = this.treeSelect.getValue();

            if (selection == null)
            {
                drawCircle(this.treeView.getTrees().get(i));
                counter++;
            }
            else if (selection.equals("ALL TREES"))
            {
                drawCircle(this.treeView.getTrees().get(i));
                counter++;
            }
            else if (this.treeView.getTrees().get(i).getName().equals(selection)) {
                drawCircle(this.treeView.getTrees().get(i));
                counter++;
            }
        }
        this.txtSummary.setText("Trees selected: " + this.treeView.getUndoStack().size());
    }

    public void drawCircle(MunicipalTree t) {
        int h = this.treeView.getHeight();
        int w = this.treeView.getWidth();
        double llx = this.treeView.getBoundaries()[0];
        double urx = this.treeView.getBoundaries()[2];
        double lly = this.treeView.getBoundaries()[1];
        double ury = this.treeView.getBoundaries()[3];
        double[] coords;

        coords = t.getLoc().getCoords();
        double yval = (double) h - h*((coords[1] - llx)/(urx - llx));
        double xval = (double) w - w*((coords[0] - lly)/(ury - lly));
        if (yval < h & yval > 0 & xval < w & xval > 0) {
            System.out.println(t.getName());
            Circle circle = new Circle();
            circle.setCenterX(xval);
            circle.setCenterY(yval);
            circle.setRadius(3);
            circle.setFill(Color.RED);
            this.treeView.getAnchorRoot().getChildren().add(circle); //attach each circle to the scene graph
            this.treeView.getUndoStack().add(circle); //add the circle to the undo stack
        }
    }
}
