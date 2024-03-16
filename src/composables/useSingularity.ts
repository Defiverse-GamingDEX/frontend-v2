import useWeb3 from '@/services/web3/useWeb3';
export default function useSingularity() {
  /**
   * COMPOSABLES
   */
  const { getProvider } = useWeb3();

  /**
   * FUNCTIONS
   */

  const connectWalletConnectProvider = () => {
    const provider = getProvider()?.provider;
    if (provider) {
      window.SingularityEvent.loginWithProvider(provider); // here  is the provider instance
    }
  };
  const initSingularity = () => {
    window.document.body.addEventListener('Singularity-mounted', () => {
      console.log('----------singularity mounted--------');

      // let key;
      // if (searchParams.get('key')) {
      //   console.log('using key through url');
      //   key = searchParams.get('key');
      // } else if (localStorage.getItem('singularity-key')) {
      //   console.log('using key through localStorage');
      //   key = localStorage.getItem('singularity-key');
      // } else {
      //   console.log('using default key value');
      //   key = 2; // default key
      // }
      // localStorage.setItem('singularity-key', key);

      window.Singularity.init('2', async () => {
        console.log('----------singularity init callback--------');
        connectWalletConnectProvider(); // TODO Optional
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
    connectWalletConnectProvider,
    initSingularity,
  };
}
