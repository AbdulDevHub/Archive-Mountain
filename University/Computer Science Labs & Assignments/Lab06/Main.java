import guidelines.*;

import java.io.IOException;

/**
 * Main class
 */
public class Main {

	public static void main(String[] args) {

		Guidelines forestryGuidelines = new Guidelines(); //make guideline object
		try { //read guidelines from file
			forestryGuidelines.readGuidelines("treeguidelines.csv"); //change this accordingly
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		forestryGuidelines.printAllGuidelines(); //print

		//make a forester in need of guidelines
		Forester noreen = new Forester();
		forestryGuidelines.register(noreen);
		forestryGuidelines.printGuideline("Balsam fir");

		//add and remove some guidelines
		forestryGuidelines.removeGuideline("Balsam fir", "Linear Park");
		forestryGuidelines.addGuideline("Balsam fir", "Community Park");
		forestryGuidelines.printGuideline("Balsam fir");
	}

}
