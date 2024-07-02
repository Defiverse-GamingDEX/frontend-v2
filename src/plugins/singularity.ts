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
  'mm9lVobr1AYSerHa5KK2LvAg1h5f0h9c',
  async () => {
    // Init success callback. All singularity methods are to be called after
    // init success
    console.log('import sucess');
  }
);
