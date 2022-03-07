import styles from './Alusta.module.css';
import icons from './icons.js';
import config from './config.js';

function Alusta(props) {

  // Selvitetään ikonitaulukon alkion indeksi.
  let index = icons.findIndex(item => (item.id === props.alusta));

  // Jos ikoni löytyy, niin muodostetaan kuvallinen merkki, muuten tekstillä.
  if (index >= 0) {
    let icon = icons[index];
    console.log(config.basename + icon.src);
    return <Label icon={config.basename + icon.src} text={icon.title} label={props.label}/>;  
  } else {
    return <Label text={props.alusta} label={props.label} />; 
  }

}

function Label(props) {
  if (props.label) {
    return <span className={styles.label}>{props.icon?<img src={props.icon} alt={props.text} />:null} {props.text}</span>    
  } else {
    return <span><img className={styles.icon} src={props.icon} alt={props.text} title={props.text} /></span>
  }
}

export default Alusta;