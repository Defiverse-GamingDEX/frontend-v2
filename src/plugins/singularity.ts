import { initializeSingularity } from 'singularity-init';
initializeSingularity(
  window,
  document,
  '1.7.24',
  'production',
  'yPfA6XtgVRV9KUeG1bxOzh0dTDzNpRFq',
  async () => {
    // Init success callback. All singularity methods are to be called after
    // init success
    console.log('import sucess');
  }
);
