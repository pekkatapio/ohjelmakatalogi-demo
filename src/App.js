import {useEffect, useState} from 'react';
import Alusta from './Alusta';
import styles from './App.module.css';
import { Router, Link } from '@reach/router';
import getSlug from 'speakingurl';

function  beautifyJSON(data) {
  let content = data.value;
  
  let result = content.map( item => ({
    'ID': item.ItemInternalId,
    'Title': item.Title,
    'kotisivu': item.kotisivu,
    'kuvaus': item.kuvaus,
    'kuvake': item.kuvake,
    'alusta': item.alusta.map( alustaitem => ( alustaitem.Value )),
    'ryhma': item.ryhma.map( ryhmaitem => ( ryhmaitem.Value )),
    'kategoria': item.kategoria.map( kategoriaitem => ( kategoriaitem.Value )),
    'lisenssi': item.lisenssi.Value,
    'muokattu': item.Modified 
  }));
  
  result = result.sort((a,b) => (a.Title > b.Title ? 1 : -1));

  return result;
}

function App() {
 
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [kategoriat, setKategoriat] = useState([]);

  useEffect( () => {
    fetch("https://prod-92.westeurope.logic.azure.com:443/workflows/de77a0fe148f4254b8eaec60f99b216c/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kU5pkikxOSTVGhq8Khhh1RyA8aon-SZvq9hkmGmpM8Q", { method: 'POST'})
      .then(res => res.json())
      .then( (result) => {
        let data = beautifyJSON(result); 
        let kategoriat = [];
        setData(data);
        data.forEach(element => {
          element.kategoria.forEach(kategoria => {
            let index = kategoriat.findIndex(item => (item.nimi === kategoria));
            if (index >= 0) {
              kategoriat[index].maara = kategoriat[index].maara + 1 
            } else {
              kategoriat.push({'nimi':kategoria, 'slug':getSlug(kategoria,{lang:'fi'}), 'maara': 1});
            }
          })
        });
        setKategoriat(kategoriat);
        setIsLoaded(true);
      },
      (error) => {
        setError(error);
        setIsLoaded(true);
      })
  }, []);
 
  if (error) {
    return <div className={styles.app_error}>No huppista, nyt kävi hassusti.<br/>Yritä pienen hetkän päästä uudestaan.. <br/><br/>{error.message}</div>
  } else if (!isLoaded) {
    return <div className={styles.app_loading}>Odota hetki, tietoja ladataan..</div>
  } else {
    return (
      <div className={styles.app}>
        <div className={styles.app_kategoriat}>
          { kategoriat.map(kategoria => (<div key={kategoria.slug}><Link to={"/ohjelmat/"+kategoria.slug}>{kategoria.nimi} ({kategoria.maara})</Link></div>)) }
        </div>
        <Router>
          <Ohjelmat data={data} kategoriat={kategoriat} default/>
          <Ohjelmat data={data} path="ohjelmat/:kategoria" kategoriat={kategoriat} />
          <Ohjelma data={data} path="ohjelma/:ohjelmaId/:slug" />
        </Router>
      </div>
    )
  }

}

function Ohjelmat(props) {

  let list;
  let kategoria = "Tuntematon kategoria";

  if (props.kategoria) {
    let index = props.kategoriat.findIndex(item => (item.slug === props.kategoria));
    if (index >= 0) {
      kategoria = props.kategoriat[index].nimi;
    } 
    list = props.data.filter(item => (item.kategoria.includes(kategoria)));
  } else {
    list = props.data;
  }

  return (
    <div>
      <h1>{props.kategoria?kategoria:'Kaikki ohjelmat'}</h1>
      { list.map( item =>  (
        <div key={item.ID} className={styles.ohjelma}>
          <div className={styles.ohjelma_kuvake_keskitä}>{item.kuvake ? <img width="52" src={item.kuvake} alt="" /> : null}</div>
          <div className={styles.ohjelma_tiedot}>
            <h2><Link to={'/ohjelma/'+item.ID+'/'+getSlug(item.Title)}>{item.Title}</Link></h2>

            <div className={styles.ohjelma_lisatiedot}>
              <div>{item.lisenssi}</div>
              <div className={styles.alusta}>
                { item.alusta.map(alustaitem => (<Alusta key={alustaitem} alusta={alustaitem} />)) }
              </div>
            </div>
          </div>
        </div>
      )) }
    </div>
  );
}

function Ohjelma(props) {

  let item = props.data.filter(item => (item.ID === props.ohjelmaId)).shift();

  let muokattu = new Date(item.muokattu);

  return (
    <div className={styles.app}>
        <div key={item.ID} className={styles.ohjelma}>
          <div className={styles.ohjelma_kuvake}>{item.kuvake ? <img width="52" src={item.kuvake} alt="" /> : null}</div>
          <div className={styles.ohjelma_tiedot}>
            <h2>{item.Title}</h2>
            <div className={styles.ohjelma_kotisivut}><a href={item.kotisivu} target='_blank' rel='noreferrer'>Valmistajan kotisivut</a></div>
            <div className={styles.ohjelma_alusta}>
              { item.alusta.map(alustaitem => (<Alusta key={alustaitem} alusta={alustaitem} label />)) }
            </div>
            <div>Kategoria: { item.kategoria.join(', ') }</div>
            <div>Lisenssi: {item.lisenssi}</div>
            <div>Käyttäjäryhmä: { item.ryhma.join(', ') }</div>
            <div className={styles.ohjelma_kuvaus}>{item.kuvaus.split("\n").map((rivi, index) => (<div key={index}>{rivi}</div>))}</div>
            <div className={styles.ohjelma_muokattu}>muokattu {muokattu.toLocaleDateString()}</div>
              
          </div>
        </div>
    </div>
  );
}


export default App;
