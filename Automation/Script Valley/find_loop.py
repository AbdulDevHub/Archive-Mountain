# /// script
# dependencies = [
#   "opencv-python",
# ]
# ///

import os
import cv2
import numpy as np
import subprocess

def find_and_extract_loop_with_audio(video_name, skip_seconds=45.0):
    video_path = os.path.join("assets", video_name)
    
    if not os.path.exists(video_path):
        print(f"❌ Could not find video at: {video_path}")
        return

    # Point to the ffmpeg.exe located one folder up in Automation-Mountain
    ffmpeg_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ffmpeg.exe"))
    
    if not os.path.exists(ffmpeg_path):
        print(f"❌ Could not find ffmpeg.exe executable at: {ffmpeg_path}")
        return

    print(f"🎬 Processing: {video_name}...")
    cap = cv2.VideoCapture(video_path)
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    skip_frames = int(fps * skip_seconds)
    if skip_frames >= total_frames:
        print(f"❌ Error: Video is shorter than the skip duration of {skip_seconds} seconds.")
        cap.release()
        return

    # Grab anchor frame at 45.0s
    cap.set(cv2.CAP_PROP_POS_FRAMES, skip_frames)
    ret, initial_frame = cap.read()
    if not ret:
        print("❌ Error reading the loop anchor frame.")
        cap.release()
        return
        
    # Process anchor frame
    target_gray = cv2.cvtColor(initial_frame, cv2.COLOR_BGR2GRAY)
    target_gray = cv2.resize(target_gray, (256, 256))
    
    best_frame_idx = None
    min_mse = float('inf')
    
    search_start_frame = skip_frames + int(fps * 5)
    cap.set(cv2.CAP_PROP_POS_FRAMES, search_start_frame)
    
    print(f"🔍 Analyzing frames...")
    for frame_idx in range(search_start_frame, total_frames):
        ret, frame = cap.read()
        if not ret:
            break
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, (256, 256))
        mse = np.mean((target_gray - gray) ** 2)
        
        if mse < min_mse:
            min_mse = mse
            best_frame_idx = frame_idx

    cap.release()

    if best_frame_idx:
        loop_end_secs = best_frame_idx / fps
        loop_duration = loop_end_secs - skip_seconds
        
        print(f"✨ Found optimal loop point at {loop_end_secs:.2f} seconds.")
        
        # Keep original webm formatting intact
        base_name = os.path.splitext(video_name)[0]
        output_path = os.path.join("assets", f"loop_{base_name}.webm")
        
        start_time_str = f"{skip_seconds:.3f}"
        duration_str = f"{loop_duration:.3f}"
        
        print(f"💾 Calling localized FFmpeg to extract slice with audio...")
        
        # Execute lossyless stream copying via explicit path
        cmd = [
            ffmpeg_path, "-y",
            "-ss", start_time_str,
            "-t", duration_str,
            "-i", video_path,
            "-c", "copy",
            output_path
        ]
        
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode == 0:
            print(f"✅ Successfully exported seamless loop with audio: {output_path}\n")
        else:
            print("❌ FFmpeg error details:")
            print(result.stderr)
    else:
        print("❌ Failed to automatically detect a loop point.")

if __name__ == "__main__":
    video_files = ["Brown Noise.webm", "Cozy Cottage.webm"] 
    
    for video in video_files:
        find_and_extract_loop_with_audio(video, skip_seconds=45.0)
