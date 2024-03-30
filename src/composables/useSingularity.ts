import useWeb3 from '@/services/web3/useWeb3';
import { useRoute } from 'vue-router';

export default function useSingularity() {
  /**
   * STATES
   */
  /**
   * COMPOSABLES
   */
  const { getProvider } = useWeb3();
  const route = useRoute();

  /**
   * FUNCTIONS
   */

  const connectWalletConnectProvider = () => {
    const provider = getProvider()?.provider;
    if (provider) {
      window.SingularityEvent.loginWithProvider(provider); // here  is the provider instance
    }
  };
  const singularityLogout = async () => {
    await window.SingularityEvent.logout();
  };
  const initSingularity = () => {
    console.log('initSingularity');
    window.document.body.addEventListener('Singularity-mounted', () => {
      console.log('----------singularity mounted--------');
      let key;
      if (route?.query?.key) {
        console.log('using key through url');
        key = route?.query?.key;
      } else if (localStorage.getItem('singularity-key')) {
        console.log('using key through localStorage');
        key = localStorage.getItem('singularity-key');
      } else {
        console.log('using default key value');
        key = 'mm9lVobr1AYSerHa5KK2LvAg1h5f0h9c'; // default key
      }
      localStorage.setItem('singularity-key', key);
      window.Singularity.init('mm9lVobr1AYSerHa5KK2LvAg1h5f0h9c', async () => {
        console.log('----------singularity init callback--------');
        window.emitter?.emit('SingularityLoaded');
        connectWalletConnectProvider(); // TODO Optional
        //window.SingularityEvent.open();
        window.SingularityEvent.subscribe('SingularityEvent-logout', () => {
          console.log('logout event received');
          //navigate('/');
          window.SingularityEvent.close();
        });

        window.SingularityEvent.subscribe('SingularityEvent-open', () => {
          console.log('SingularityEvent-open');
        });

        window.SingularityEvent.subscribe('SingularityEvent-close', () => {
          console.log('subscribe close drawer ');
        });

        window.SingularityEvent.subscribe(
          'SingularityEvent-onTransactionApproval',
          data => {
            console.log('Txn approved', JSON.parse(data));
          }
        );
        window.SingularityEvent.subscribe(
          'SingularityEvent-onTokenExpired',
          data => {
            console.log('Token expired', JSON.parse(data));
          }
        );
        window.SingularityEvent.subscribe(
          'SingularityEvent-onTransactionSuccess',
          data => {
            console.log('Txn Successfull', JSON.parse(data));
          }
        );
        window.SingularityEvent.subscribe(
          'SingularityEvent-onTransactionFailure',
          data => {
            console.log('Txn failed', JSON.parse(data));
          }
        );

        window.SingularityEvent.subscribe('SingularityEvent-login', data => {
          console.log('login data --->', data);
        });
      });
    });
  };

  return {
    // methods
    connectWalletConnectProvider,
    initSingularity,
    singularityLogout,
  };
}
