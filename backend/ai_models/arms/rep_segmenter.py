import numpy as np
from angle_utils import calculate_angle

class RepBuffer:
    def __init__(self):
        # Shoulder angles (main movement)
        self.r_shoulder_angles = []
        self.l_shoulder_angles = []

        # Elbow angles (form check)
        self.r_elbow_angles = []
        self.l_elbow_angles = []

        # Wrist vertical movement
        self.r_wrist_y = []
        self.l_wrist_y = []

        # Torso posture
        self.torso_angles = []

        # Timing
        self.frames = 0

    def add_frame(
        self,
        r_sh, r_el, r_wr,
        l_sh, l_el, l_wr,
        r_hip, l_hip
    ):
        # Shoulder angle (hip-shoulder-elbow)
        self.r_shoulder_angles.append(
            calculate_angle(r_hip, r_sh, r_el)
        )
        self.l_shoulder_angles.append(
            calculate_angle(l_hip, l_sh, l_el)
        )

        # Elbow angle (shoulder-elbow-wrist)
        self.r_elbow_angles.append(
            calculate_angle(r_sh, r_el, r_wr)
        )
        self.l_elbow_angles.append(
            calculate_angle(l_sh, l_el, l_wr)
        )

        # Wrist movement
        self.r_wrist_y.append(r_wr[1])
        self.l_wrist_y.append(l_wr[1])

        # Torso angle
        hip_mid = ((r_hip[0] + l_hip[0]) / 2, (r_hip[1] + l_hip[1]) / 2)
        shoulder_mid = ((r_sh[0] + l_sh[0]) / 2, (r_sh[1] + l_sh[1]) / 2)
        vertical_ref = (hip_mid[0], hip_mid[1] - 100)

        self.torso_angles.append(
            calculate_angle(shoulder_mid, hip_mid, vertical_ref)
        )

        self.frames += 1

    def summarize(self, label):
        if self.frames == 0:
            return None

        r_range = np.max(self.r_shoulder_angles) - np.min(self.r_shoulder_angles)
        l_range = np.max(self.l_shoulder_angles) - np.min(self.l_shoulder_angles)

        # ✅ FIX 1: Stable asymmetry (based on range, not per-frame noise)
        shoulder_asymmetry = abs(r_range - l_range)

        # ✅ FIX 2: Normalize asymmetry (VERY IMPORTANT)
        if max(r_range, l_range) > 0:
            shoulder_asymmetry = shoulder_asymmetry / max(r_range, l_range)

        # ✅ FIX 3: Remove noise
        if shoulder_asymmetry < 0.1:
            shoulder_asymmetry = 0

        return {
            "r_shoulder_range": float(r_range),
            "l_shoulder_range": float(l_range),

            "r_elbow_avg": float(np.mean(self.r_elbow_angles)),
            "l_elbow_avg": float(np.mean(self.l_elbow_angles)),

            "wrist_y_range": float(
                max(np.max(self.r_wrist_y), np.max(self.l_wrist_y)) -
                min(np.min(self.r_wrist_y), np.min(self.l_wrist_y))
            ),

            # ✅ FIXED asymmetry
            "shoulder_asymmetry": float(shoulder_asymmetry),

            "torso_angle_mean": float(np.mean(self.torso_angles)),

            "frames": self.frames,
            "label": label
        }