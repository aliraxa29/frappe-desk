import { dom } from "./dom";
import { user } from "./user";
import * as model from "./model";
import * as sync from "./locals/sync";
import { getLocalsStore } from "./locals/localsGlobal";
import * as _model from "../data/model";
import { defineForm } from "../runtime/formContext";
import { defineList } from "../runtime/listRuntime";
import { desk } from "./desk";

window.desk = {
  dom,
  user,
  model: {
    ..._model.model,
    ...model,
  },
  sync,
  _getLocalsStore: getLocalsStore,
  script: {
    defineForm,
    defineList,
  },
  ...desk,
};

(window as any).defineForm = defineForm;
(window as any).defineList = defineList;
