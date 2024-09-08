package guidelines.observer;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * ObservableGuideline class, an abstract observable object type
 */
public abstract class ObservableGuideline {
	
	// Guidelines to be observed
	private HashMap<String, ArrayList<String>> guidelines = new HashMap<>();

	/**
	 * register, ie add to list of observers
	 *
	 * @param o who is observing
	 */
	public abstract void register(GuidelineObserver o);

	/**
	 * unregister, ie remove from list of observers
	 *
	 * @param o who is observing
	 */
	public abstract void unregister(GuidelineObserver o);

	/**
	 * Notify observers of change
	 */
	public abstract void notifyObservers();

	/**
	 * Notify observers of change, if in observable state
	 *
	 * @param guidelines current guidelines
	 */
	public void setObservableState(HashMap<String, ArrayList<String>> guidelines) {
		// We want to observe the state, then notify all the observers
		this.guidelines = guidelines;
		this.notifyObservers();
	}

	/**
	 * Get observable state (i.e guidelines)
	 */
	public HashMap<String, ArrayList<String>> getGuidelines() {
		// return the Observable State
		return this.guidelines;
	}
}
