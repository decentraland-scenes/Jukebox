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
    position: new Vector3(0.05, 0, -0.1)
  }))
  const text = new TextShape(songs[i].name)
  text.fontSize = 1
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
  buttonArray[i].addComponent(new OnClick( e => {
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
	  sceneMessageBus.emit("buttonPressed", {button:i, pressed: state.pressed})
  }
  
  // To execute when pressing a button a panel
	sceneMessageBus.on("buttonPressed", (info) => {	
		if (info.pressed){
		  log("pressed ", info.button)
		  buttonArray[info.button].getComponent(AudioSource).playing = true
		}
		for (let i = 0; i < songs.length; i ++){
		  if (i !== info.button){
			buttonArray[i].getComponent(ButtonState).pressed = false
			buttonArray[i].getComponent(AudioSource).playing = false
		  }
		}
	});
  
  
	// To get the initial state of the scene when joining
	sceneMessageBus.emit("getState",{})
	
	// To return the initial state of the scene to new players
	sceneMessageBus.on("getState", () => {
	  for (let i = 0; i < buttonArray.length; i ++){
		  if (buttonArray[i].getComponent(ButtonState).pressed == true ){
			  sceneMessageBus.emit("buttonPressed", {button:i, pressed: true})
			  return
		  }
		}
	});
  
  
  
  // ground
  let floor = new Entity()
  floor.addComponent(new GLTFShape("models/FloorBaseGrass.glb"))
  floor.addComponent(new Transform({
	position: new Vector3(8, 0, 8), 
	scale:new Vector3(1.6, 0.1, 1.6)
  }))
  engine.addEntity(floor)