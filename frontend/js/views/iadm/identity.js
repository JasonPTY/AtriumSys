import { state } from "../../core/state.js";
import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { applyTheme } from "../../core/theme.js";
import { INST, persistInstitutions } from "../../data/institutions.js";
import { toast } from "../../ui/toast.js";

/** Vista previa de la identidad (sidebar + datos) usada en el formulario. */
export const identityPreview = (d) =>
  `<div class="pvw"><div class="pvs" style="background:linear-gradient(180deg,#0B1B54,#1E3A8A)"><span class="lg">${d.logo ? `<img src="${d.logo}" alt="">` : (d.s || "").slice(0, 2)}</span><div><b>ATRIUM</b><br><small>${d.n || ""}</small></div></div><div class="pvb"><b>${d.n || "Nombre de la institución"}</b><br><small style="color:var(--mu)">${d.lema || ""}</small><br><small style="color:var(--mu)">${[d.web, d.mail].filter(Boolean).join(" · ")}</small></div></div>`;

/** Identidad de la institucion activa (admin institucional). Edita un borrador y guarda con identitySave(). */
export function identityView() {
  if (!state.instDraft || state.instDraft.id != state.inst) state.instDraft = { ...INST[state.inst], id: state.inst };
  const d = state.instDraft;
  const field = (label, k) => `<div class="mrow"><label>${label}</label><input value="${d[k] || ""}" oninput="identityField('${k}',this.value)"></div>`;
  return (
    `<div class="ins"><div class="card"><h3>Identidad de la institución</h3>${field("Nombre", "n")}${field("Nombre corto", "s")}${field("Lema", "lema")}${field("Sitio web", "web")}${field("Correo de contacto", "mail")}` +
    `<div class="mrow"><label>Logo</label><div class="cp"><input type="file" accept="image/*" onchange="identityLogo(this)">${d.logo ? '<button class="btn o" onclick="identityRemoveLogo()">Quitar</button>' : ""}</div></div>` +
    `<div class="acts" style="justify-content:flex-end;margin:14px 0 0"><button class="btn g" onclick="identitySave()">Guardar cambios</button></div></div>` +
    `<div class="card"><h3>Vista previa</h3><div id="ipv">${identityPreview(d)}</div><p style="color:var(--mu);margin:12px 0 0;font-size:12px">Al guardar, los profesores y estudiantes de esta institución verán estos cambios.</p></div></div>`
  );
}

function identityField(key, value) {
  state.instDraft[key] = value;
  $("ipv").innerHTML = identityPreview(state.instDraft);
}

function identityRemoveLogo() {
  state.instDraft.logo = "";
  render();
}

/** El logo se lee como data URL (max. 300 KB). Con backend: subirlo y guardar la URL. */
function identityLogo(input) {
  const f = input.files[0];
  if (!f) return;
  if (f.size > 300000) {
    input.value = "";
    return toast("El logo debe pesar menos de 300 KB");
  }
  const r = new FileReader();
  r.onload = () => identityField("logo", r.result);
  r.readAsDataURL(f);
}

/** Punto de integracion: guardar la identidad de la institucion. */
function identitySave() {
  const draft = state.instDraft;
  if (!draft.n.trim() || !draft.s.trim()) return toast("Completa nombre y nombre corto");
  const { id, ...data } = draft;
  INST[state.inst] = data;
  persistInstitutions();
  applyTheme();
  render();
  toast("Identidad actualizada");
}

export const identityHandlers = { identityField, identityRemoveLogo, identityLogo, identitySave };
