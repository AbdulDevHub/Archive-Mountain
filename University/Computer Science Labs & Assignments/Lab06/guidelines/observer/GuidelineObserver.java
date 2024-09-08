package guidelines.observer;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * GuidelineObserver interface
 */
public interface GuidelineObserver {

	/**
	 * Receive notification from observable and update
	 *
	 * @param observerState Updated guidelines
	 */
	void update(HashMap<String, ArrayList<String>> observerState);

}
