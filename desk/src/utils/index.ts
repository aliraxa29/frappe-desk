import { dom } from "./dom"
import { user } from "./user"
import * as model from "./model"
import * as sync from "./locals/sync"
import { getLocalsStore } from "./locals/localsGlobal"
import * as _model from "../data/model"

window.desk = {
    dom,
    user,
    model: {
        ..._model.model,
        ...model
    },
    sync,
    _getLocalsStore: getLocalsStore,
}