// Custom button component

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

// Component group

const buttons = engine.getComponentGroup(Transform, ButtonState)

// Button system   (buttons remain pressed)

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