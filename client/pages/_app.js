import 'bootstrap/dist/css/bootstrap.css';
import AppHeader from '../components/header';
//import buildClient from '../api/build-client';

const AppComponent = ({ Component, pageProps }) => {
  return (
    <div>
      <AppHeader {...pageProps} />
      <Component {...pageProps} />
    </div>
  );
};

// getinitialprops is deprecated and this should be implemented ofn every page separately
//export const getServerSideProps = async (appContext) => {
//  //try {
//  console.log(appContext);
//  const client = buildClient(appContext.ctx);
//  const { data } = await client.get('/api/users/currentuser');
//  const pageProps = await appContext.Component.getServerSideProps(
//    appContext.ctx
//  );
//  console.log(pageProps);
//  //} catch {
//  //return { props: {} };
//  //}
//  return { pageProps, ...data };
//};

export default AppComponent;
