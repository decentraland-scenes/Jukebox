// import sound controller
import { playSound } from '@decentraland/SoundController'

// Define song list
const songs: {src: string, name: string}[] = 
[
  {src: "sounds/Telemann.mp3", name: "Telemann"},
  {src: "sounds/Bach.mp3", name: "Bach"},
  {src: "sounds/Brahms.mp3", name: "Brahms"},
  {src: "sounds/Chopin.mp3", name: "Chopin"},
];


////////////////////////
// Custom components

@Component('buttonState')
export class ButtonState {
  pressed: boolean = false
  zUp: number = 0
  zDown: number = 0
  fraction: number = 0
  constructor(zUp: number, zDown: number){
    this.zUp = zUp
    this.zDown = zDown
  }
}

///////////////////////////
// Entity groups

const buttons = engine.getComponentGroup(Transform, ButtonState)

///////////////////////////
// Systems

export class PushButton implements ISystem {
  update() {
    for (let button of buttons.entities) {
      let transform = button.get(Transform)
      let state = button.get(ButtonState)
      if (state.pressed == true && state.fraction < 1){
        transform.position.z = Scalar.Lerp(state.zUp, state.zDown, state.fraction)
        state.fraction += 1/8
      } 
      else if (state.pressed == false && state.fraction > 0){
        transform.position.z = Scalar.Lerp(state.zUp, state.zDown, state.fraction)
        state.fraction -= 1/8
      }
    }
  }
}

engine.addSystem(new PushButton)


///////////////////////////
// INITIAL ENTITIES


// Jukebox
const jukebox = new Entity()
jukebox.set(new GLTFShape("models/Jukebox.gltf"))
jukebox.set(new Transform({
  position: new Vector3(5, 0, 9.5),
  rotation: Quaternion.Euler(0, 0 ,0),
  scale: new Vector3(0.6, 0.6, 0.6)
}))
engine.addEntity(jukebox)


// Material for buttons
const buttonMaterial = new Material()
buttonMaterial.albedoColor = Color3.FromHexString("#cc0000")


// Buttons
let buttonArray =  []

for (let i = 0; i < songs.length; i ++){
  let posX = i % 2 == 0 ? -.4 : .1;
  let posY = Math.floor(i / 2) == 0 ? 1.9 : 1.77;

  // groups the button itself and label
  const buttonWrapper = new Entity()
  buttonWrapper.set(new Transform({
    position: new Vector3(posX, posY, -0.7)
  }))
  buttonWrapper.setParent(jukebox)
  engine.addEntity(buttonWrapper)

  const buttonLabel = new Entity()
  buttonLabel.set(new Transform({
    position: new Vector3(0.6, 0, -0.1)
  }))
  const text = new TextShape(songs[i].name)
  text.fontSize = 35
  text.fontFamily = "serif"
  text.hAlign = "left"  
  text.color = Color3.FromHexString("#800000")
  buttonLabel.set(text) 
  buttonLabel.setParent(buttonWrapper)
  engine.addEntity(buttonLabel)

  buttonArray[i] = new Entity()
  buttonArray[i].set(new Transform({
    position: new Vector3(0, 0, 0),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  }))
  buttonArray[i].set(buttonMaterial)
  buttonArray[i].setParent(buttonWrapper)
  buttonArray[i].set(new CylinderShape()) 
  buttonArray[i].set(new ButtonState(0, 0.1))
  buttonArray[i].set(new OnClick( e => {
    pressButton(i)
  }))

  engine.addEntity(buttonArray[i])
}

///////////////////////////////////////
//OTHER FUNCTIONS

function pressButton(i:number){
  let state = buttonArray[i].get(ButtonState)
    state.pressed = !state.pressed
    if (state.pressed){
      playSong(i)
    }
    for (let j = 0; j < songs.length; j ++){
      if (j !== i){
        buttonArray[j].get(ButtonState).pressed = false
      }
    }
}

function playSong(i: number){
  let songPath = songs[i].src
  log(songPath)
  executeTask(async () => {
    try {
      await playSound(songs[i].src, {
        loop: true,
        volume: 100,
      })
    } catch {
      log('failed to play sound')
    }
  })
}
