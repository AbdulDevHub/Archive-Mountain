package guidelines;

import guidelines.observer.ObservableGuideline;
import guidelines.observer.GuidelineObserver;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

/**
 * Guidelines class, guidelines for tree planting.  From
 * https://www.richmondhill.ca/en/shared-content/resources/documents/urban-forest-planting-guidelines.pdf
 */
public class Guidelines extends ObservableGuideline {

    private List<GuidelineObserver> foresterList = new ArrayList<>(); //these are the foresters looking for guidelines.

    /**
     * register, ie add to list of observers
     *
     * @param o who is observing
     */
    @Override
    public void register(GuidelineObserver o) {
        foresterList.add(o);
    }

    /**
     * unregister, ie remove from list of observers
     *
     * @param o who is observing
     */
    @Override
    public void unregister(GuidelineObserver o) {
        foresterList.remove(o);
    }

    /**
     * Notify observers of change
     */
    @Override
    public void notifyObservers() {
        for (int i = 0; i < foresterList.size(); i++){foresterList.get(i).update(this.getGuidelines());}
    }


    /**
     * add guideline about a given tree name
     *
     * @param treeName name of tree
     * @param env location where planting is ok
     */
    public void addGuideline(String treeName, String env) {
        if (this.getGuidelines().containsKey(treeName)) {this.getGuidelines().get(treeName).add(env);}
        else {this.getGuidelines().put(treeName, new ArrayList<String>(Arrays.asList(env)));}
    }

    /**
     * remove guideline about a given tree name
     *
     * @param treeName name of tree
     * @param env location where planting is no longer ok
     */
    public void removeGuideline(String treeName, String env) {
        if (this.getGuidelines().containsKey(treeName)) {
            if (this.getGuidelines().get(treeName).contains(env)) {
                this.getGuidelines().get(treeName).remove(env);
            }
        }
    }


    /**
     * read guidelines from file
     *
     * @param filename of file containing guidelines
     */
    public void readGuidelines(String filename) throws IOException {

        String[] options = {"Urban Square","Linear Park","Neighbourhood Park","Community Park","Destination Park"};
        String line = "";
        int count = 0;
        try
        {
            //parsing a CSV file into BufferedReader class constructor
            BufferedReader br = new BufferedReader(new FileReader(filename));
            while ((line = br.readLine()) != null)   //returns a Boolean value
            {
                count += 1;
                if (count == 1) continue; //forget the header row
                String[] record = line.split(",");    // use comma as separator
                int i;
                for (i = 1; i < record.length; i++) {
                    if (record[i].equals("True")) addGuideline(record[0], options[i - 1]);
                }
            }
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e)
        {
            e.printStackTrace();
        }

    }

    /**
     * print guidelines
     */
    public void printAllGuidelines() {
        HashMap<String, ArrayList<String>> s = this.getGuidelines();
        for (String tree: s.keySet()) {
            printGuideline(tree);
            System.out.println();
        }
    }

    /**
     * print guideline for a given tree name
     *
     * @param treeName name of tree needing guidelines
     */
    public void printGuideline(String treeName) {
        ArrayList<String> locs = this.getGuidelines().getOrDefault(treeName, new ArrayList<>());
        if (locs.size() > 0) {
            System.out.println("The tree named " + treeName + " can be planted in these urban locations:");
            for (String loc : locs) {
                System.out.println(loc);
            }
        } else {
            System.out.println("There are no location where " + treeName + " can be planted.");
        }
    }



}
