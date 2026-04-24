// ============================================================
// SquatPostureCheckPage.jsx
// ============================================================

import PostureCheckPage from './PostureCheckPage';

// Optional: import images when you have them
// import feetWidthImg    from '../../assets/squat-feet-width.jpg';
// import chestUpImg      from '../../assets/squat-chest-up.jpg';
// import kneeAlignImg    from '../../assets/squat-knee-align.jpg';
// import spineImg        from '../../assets/squat-core-breath.jpg';
// import depthControlImg from '../../assets/squat-depth-control.jpg';

const squatPostureItems = [
  {
    id: 'feet',
    title: 'Feet Position',
    instruction:
      'Keep feet shoulder-width apart with toes slightly outward.',
    // image: feetWidthImg,
    icon: '👣',
  },
  {
    id: 'chest',
    title: 'Chest Up',
    instruction:
      'Keep chest up and core tight before lowering down.',
    // image: chestUpImg,
    icon: '💪',
  },
  {
    id: 'knees',
    title: 'Knees Aligned',
    instruction:
      'Push knees outward and keep them in line with toes.',
    // image: kneeAlignImg,
    icon: '🦵',
  },
  {
    id: 'spine',
    title: 'Neutral Spine',
    instruction:
      'Keep your back straight and head facing forward.',
    // image: spineImg,
    icon: '🧘',
  },
  {
    id: 'depth',
    title: 'Controlled Depth',
    instruction:
      'Squat down with control and push up through your heels.',
    // image: depthControlImg,
    icon: '⬇️',
  },
];

export default function SquatPostureCheckPage() {
  return (
    <PostureCheckPage
      exerciseTitle="Squat"
      navigateTo="/Squat"
      postureItems={squatPostureItems}
    />
  );
}