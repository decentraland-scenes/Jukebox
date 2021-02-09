import * as utils from '@dcl/ecs-scene-utils'

/////// Define song list
const songs: { src: string; name: string }[] = [
  { src: 'sounds/Telemann.mp3', name: 'Telemann' },
  { src: 'sounds/Bach.mp3', name: 'Bach' },
  { src: 'sounds/Brahms.mp3', name: 'Brahms' },
  { src: 'sounds/Chopin.mp3', name: 'Chopin' },
]

///////////////////////////
// INITIAL ENTITIES

// Jukebox
const jukebox = new Entity()
jukebox.addComponent(new GLTFShape('models/Jukebox.gltf'))
jukebox.addComponent(
  new Transform({
    position: new Vector3(5, 0, 9.5),
    rotation: Quaternion.Euler(0, 180, 0),
    scale: new Vector3(0.6, 0.6, 0.6),
  })
)
engine.addEntity(jukebox)

// Buttons
let buttonArray = []

let clickOffset = new Vector3(0, 0, 0.02)
let buttonPos = new Vector3(0, 0, -0.04)

for (let i = 0; i < songs.length; i++) {
  let posX = i % 2 == 0 ? -0.03 : 0.4
  let posY = Math.floor(i / 2) == 0 ? 1.9 : 1.77

  // groups the button itself and label
  const buttonWrapper = new Entity()
  buttonWrapper.addComponent(
    new Transform({
      position: new Vector3(posX, posY, 0.7),
      rotation: Quaternion.Euler(0, 180, 0),
    })
  )
  buttonWrapper.setParent(jukebox)
  engine.addEntity(buttonWrapper)

  const buttonLabel = new Entity()
  buttonLabel.addComponent(
    new Transform({
      position: new Vector3(0.05, 0, -0.1),
    })
  )
  const text = new TextShape(songs[i].name)
  text.fontSize = 1
  text.hTextAlign = 'left'
  text.color = Color3.FromHexString('#800000')
  buttonLabel.addComponent(text)
  buttonLabel.setParent(buttonWrapper)
  engine.addEntity(buttonLabel)

  buttonArray[i] = new Entity()
  buttonArray[i].addComponent(
    new Transform({
      position: new Vector3(0, 0, -0.04),
      rotation: Quaternion.Euler(270, 0, 0),
      scale: new Vector3(0.3, 0.3, 0.3),
    })
  )
  buttonArray[i].setParent(buttonWrapper)
  buttonArray[i].addComponent(new GLTFShape('models/Button.glb'))

  buttonArray[i].addComponent(
    new utils.ToggleComponent(utils.ToggleState.Off, (value) => {
      if (value == utils.ToggleState.On) {
        buttonArray[i].addComponentOrReplace(
          new utils.MoveTransformComponent(buttonPos, clickOffset, 0.5)
        )
        buttonArray[i].getComponent(AudioSource).playing = true
      } else {
        if (buttonArray[i].getComponent(AudioSource).playing) {
          buttonArray[i].getComponent(AudioSource).playing = false
          buttonArray[i].addComponentOrReplace(
            new utils.MoveTransformComponent(clickOffset, buttonPos, 0.5)
          )
        }
      }
    })
  )

  buttonArray[i].addComponent(
    new OnPointerDown(
      (e) => {
        pressButton(i)
      },
      { button: ActionButton.POINTER, hoverText: songs[i].name }
    )
  )

  // generate audio components
  let song = new AudioClip(songs[i].src)

  let audioSource = new AudioSource(song)
  audioSource.playing = false
  buttonArray[i].addComponent(audioSource)

  engine.addEntity(buttonArray[i])
}

///////////////////////////////////////
//HELPER FUNCTIONS

function pressButton(i: number) {
  buttonArray[i].getComponent(utils.ToggleComponent).toggle()
  for (let j = 0; j < songs.length; j++) {
    if (j != i) {
      buttonArray[j]
        .getComponent(utils.ToggleComponent)
        .set(utils.ToggleState.Off)
    }
  }
}

// ground
let floor = new Entity()
floor.addComponent(new GLTFShape('models/FloorBaseGrass.glb'))
floor.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    scale: new Vector3(1.6, 0.1, 1.6),
  })
)
engine.addEntity(floor)
