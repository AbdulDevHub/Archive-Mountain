import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ChoiceBox;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;
import javafx.geometry.Insets;

import treeviz.*; //import visualization helpers

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.*;

/**
 * This is the main program.
 */
public class TreeViewer extends Application {

    private Stack<Object> undoStack; //undo stack, to facilitate drawing/erasing of graphics objects
    private List<MunicipalTree> trees; //list of trees in the city
    private AnchorPane anchorRoot; //root of the scene graph

    //UI elements on a tree view we will want other methods to access
    private final ChoiceBox<Object> treeSelect; //the list of tree options
    private TextField txtSummary; //a summary of the trees on the map

    private final int h = 417; //dimensions of the map for display
    private final int w = 600;
    private final double urx = 43.55618; //coordinate boundaries of the map
    private final double ury = -79.68072;
    private final double llx = 43.52961;
    private final double lly = -79.62886;

    /**
     * Make a TreeViewer, to view trees in Mississauga
     */
    public TreeViewer() {

        //get the tree list from the file
        try {
            String filename = "treelist.csv"; //change this accordingly
            trees = TreeReader.readTreesFromFile(filename);
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }

        //get the tree types
        final Set<String> types = TreeInfo.getTreeTypes(trees);
        List<String> sortedList = new ArrayList<>(types);
        Collections.sort(sortedList);
        sortedList.add(0, "ALL TREES");

        //create the UI element to hold the tree types
        this.treeSelect = new ChoiceBox<>(FXCollections
                .observableArrayList(sortedList));
    }

    /** Main method
     */
    public static void main(String[] args) {
        launch(args);
    }

    /** Start the visualization
     */
    public void start(Stage primaryStage) {

        //load the map to visualize
        FileInputStream input = null;
        try {
            input = new FileInputStream("map.png"); //change this accordingly
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        assert input != null;
        Image image = new Image(input, w, h, false, false);
        ImageView iv = new ImageView(image); //place the map on the UI
        iv.setFitHeight(h);
        iv.setFitWidth(w);
        anchorRoot = new AnchorPane();
        anchorRoot.getChildren().add(iv); //attach the map to the scene graph

        //create undo stack for visualized objects
        double[] coords;
        undoStack = new Stack<>();
        //add circles to visualization at locations of trees
        for (MunicipalTree t: trees) {
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
                anchorRoot.getChildren().add(circle); //attach each circle to the scene graph
                undoStack.add(circle); //add the circle to the undo stack
            }
        }

        //add button to UI
        Button filterTrees = new Button("Filter Tree List");
        filterTrees.setId("filterTrees");

        //add text field to UI
        txtSummary = new TextField();
        txtSummary.setId("txtSummary");
        txtSummary.setText("Trees selected: " + undoStack.size());

        //add event handler to UI
        TreeFilterEventHandler treeHandler = new TreeFilterEventHandler(this);
        filterTrees.addEventHandler(MouseEvent.MOUSE_CLICKED, treeHandler);

        //set UI elements within a horizontal box
        HBox hbox = new HBox(treeSelect, filterTrees, txtSummary);
        HBox.setHgrow(txtSummary, Priority.ALWAYS);
        hbox.setPadding(new Insets(10));
        hbox.setSpacing(10);

        //set horizontal box within a virtical box and attach to the scene graph
        VBox vbox = new VBox(hbox, anchorRoot);

        //attach all scene graph elements to the scene
        Scene scene = new Scene(vbox);
        primaryStage.setScene(scene); //set the scene ...
        primaryStage.show(); //... and ... go.

    }

    /** Get latitude and longitude boundaries of display
     *
     * @return array of doubles holding: lat, lon coordinate of lower left boundary followed by lat, lon coordinate of upper right boundary on display
     */
    public double[] getBoundaries() {
        return new double[]{llx, lly, urx, ury};
    }

    /** Get height of display
     *
     * @return height of display in px
     */
    public int getHeight() {
        return h;
    }

    /** Get width of display
     *
     * @return width of display in px
     */
    public int getWidth() {
        return w;
    }

    /** Get Anchor Root, used for event handling
     *
     * @return anchorRoot
     */
    public AnchorPane getAnchorRoot() {
        return anchorRoot;
    }

    /**
     * Get getTreeSelect, useful for event handling
     *
     * @return ChoiceBox
     */
    public ChoiceBox getTreeSelect() {
        return this.treeSelect;
    }

    /** Get getTxtSummary, useful for event handling
     *
     * @return TextField
     */
    public TextField getTxtSummary() {
        return this.txtSummary;
    }

    /** Get getUndoStack, useful for event handling
     *
     * @return undoStack
     */
    public Stack getUndoStack() { return this.undoStack; }

    /** Get Tree List, useful for event handling
     *
     * @return trees
     */
    public List<MunicipalTree> getTrees() { return this.trees; }
}
