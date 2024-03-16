import { initializeSingularity } from 'singularity-init';
declare global {
  interface Window {
    SingularityEvent: any;
    Singularity: any;
  }
}
initializeSingularity(
  window,
  document,
  '1.7.29',
  'production',
  'yPfA6XtgVRV9KUeG1bxOzh0dTDzNpRFq',
  async () => {
    // Init success callback. All singularity methods are to be called after
    // init success
    console.log('import sucess');
  }
);
