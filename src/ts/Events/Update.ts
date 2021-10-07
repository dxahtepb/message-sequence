import {Settings} from "../Settings";

export interface UpdateEventDetails {
  settings: Settings
}

export class UpdateEvent extends CustomEvent<UpdateEventDetails> {
  static TYPE = "messageSequenceUpdate"

  constructor(settings: Settings) {
    super(UpdateEvent.TYPE, {
      detail: {
        settings: settings
      }
    });
  }
}
