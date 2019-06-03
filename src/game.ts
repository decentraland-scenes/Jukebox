import { PushButton, ButtonState } from './modules/buttons';



/////// Define song list
const songs: {src: string, name: string}[] = 
[
  {src: "sounds/Telemann.mp3", name: "Telemann"},
  {src: "sounds/Bach.mp3", name: "Bach"},
  {src: "sounds/Brahms.mp3", name: "Brahms"},
  {src: "sounds/Chopin.mp3", name: "Chopin"},
];


// Start button system
engine.addSystem(new PushButton)


///////////////////////////
// INITIAL ENTITIES

// Jukebox
const jukebox = new Entity()
jukebox.addComponent(new GLTFShape("models/Jukebox.gltf"))
jukebox.addComponent(new Transform({
  position: new Vector3(5, 0, 9.5),
  rotation: Quaternion.Euler(0, 180 ,0),
  scale: new Vector3(0.6, 0.6, 0.6)
}))
engine.addEntity(jukebox)



// Material for buttons
const buttonMaterial = new Material()
buttonMaterial.albedoColor = Color3.FromHexString("#cc0000")


// Buttons
let buttonArray =  []

for (let i = 0; i < songs.length; i ++){
  let posX = i % 2 == 0 ? -.1 : .4;
  let posY = Math.floor(i / 2) == 0 ? 1.9 : 1.77;

  // groups the button itself and label
  const buttonWrapper = new Entity()
  buttonWrapper.addComponent(new Transform({
    position: new Vector3(posX, posY, 0.7),
    rotation: Quaternion.Euler(0, 180 ,0)
  }))
  buttonWrapper.setParent(jukebox)
  engine.addEntity(buttonWrapper)

  const buttonLabel = new Entity()
  buttonLabel.addComponent(new Transform({
    position: new Vector3(0.6, 0, -0.1)
  }))
  const text = new TextShape(songs[i].name)
  text.fontSize = 3.5
  //text.fontFamily = "serif"
  text.hTextAlign = "left"
  text.color = Color3.FromHexString("#800000")
  buttonLabel.addComponent(text) 
  buttonLabel.setParent(buttonWrapper)
  engine.addEntity(buttonLabel)

  buttonArray[i] = new Entity()
  buttonArray[i].addComponent(new Transform({
    position: new Vector3(0, 0, 0),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  }))
  buttonArray[i].addComponent(buttonMaterial)
  buttonArray[i].setParent(buttonWrapper)
  buttonArray[i].addComponent(new CylinderShape()) 
  buttonArray[i].addComponent(new ButtonState(0, 0.1))
  buttonArray[i].addComponent(new OnPointerDown( e => {
    pressButton(i)
  }))

  // generate audio components
  let song = new AudioClip(songs[i].src)

  let audioSource = new AudioSource(song)
  audioSource.playing = false
  buttonArray[i].addComponent(audioSource)

  engine.addEntity(buttonArray[i])
}

///////////////////////////////////////
//HELPER FUNCTIONS

function pressButton(i:number){
  let state = buttonArray[i].getComponent(ButtonState)
    state.pressed = !state.pressed
    if (state.pressed){
      buttonArray[i].getComponent(AudioSource).playing = true
    }
    for (let j = 0; j < songs.length; j ++){
      if (j !== i){
        buttonArray[j].getComponent(ButtonState).pressed = false
        buttonArray[j].getComponent(AudioSource).playing = false
      }
    }
}
