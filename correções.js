/* CS HADA 肌 · Ficha de Anamnese · correcoes.js
   Carregar no index.html, logo antes de </body>, DEPOIS do script principal:
   <script src="correcoes.js"></script>

   O que corrige:
   - Campos "objetivo" e "conhec" que eram lidos, mas não existiam na ficha
   - Envio mais robusto (sem preflight de CORS, com tempo limite e plano B)
   - E-mail vazio ou inválido não trava mais o envio
   - Avisos dentro da página, no lugar de alert()
   - Aviso para abrir no Safari/Chrome quando estiver no navegador do Instagram/Facebook
   - Respostas de listas sempre em português, mesmo se a cliente usar a ficha em espanhol
   - Nomes dos tratamentos legíveis no e-mail que você recebe
*/
(function () {
  'use strict';

  var ENDPOINT = 'https://formspree.io/f/meewodwv';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var $ = function (id) { return document.getElementById(id); };
  var lang = function () { return document.body.classList.contains('lang-es') ? 'es' : 'pt'; };

  var T = {
    pt: {
      nome: 'Por favor, preencha seu nome completo.',
      nascimento: 'Por favor, preencha sua data de nascimento.',
      whatsapp: 'Por favor, preencha seu WhatsApp para que possamos entrar em contato.',
      email: 'Confira o e-mail digitado: ele parece incompleto.',
      modalidade: 'Por favor, selecione a modalidade de atendimento.',
      consentimento: 'Por favor, confirme o consentimento para prosseguir.',
      assinatura: 'Por favor, assine com seu nome completo.',
      enviando: 'Enviando...',
      enviar: 'Enviar ficha ✓',
      falhaTitulo: 'Não conseguimos enviar agora',
      falhaTexto: 'Suas respostas continuam aqui. Copie o texto abaixo e envie para a Carol pelo WhatsApp, ou abra este link no Safari ou Chrome e tente de novo.',
      copiar: 'Copiar respostas',
      copiado: 'Respostas copiadas ✓',
      tentar: 'Tentar enviar novamente',
      linkCopiado: 'Link copiado. Cole no Safari ou Chrome.'
    },
    es: {
      nome: 'Por favor, completa tu nombre completo.',
      nascimento: 'Por favor, completa tu fecha de nacimiento.',
      whatsapp: 'Por favor, completa tu WhatsApp para que podamos contactarte.',
      email: 'Revisa el correo ingresado: parece incompleto.',
      modalidade: 'Por favor, selecciona la modalidad de atención.',
      consentimento: 'Por favor, confirma el consentimiento para continuar.',
      assinatura: 'Por favor, firma con tu nombre completo.',
      enviando: 'Enviando...',
      enviar: 'Enviar ficha ✓',
      falhaTitulo: 'No pudimos enviar en este momento',
      falhaTexto: 'Tus respuestas siguen aquí. Copia el texto de abajo y envíaselo a Carol por WhatsApp, o abre este enlace en Safari o Chrome e inténtalo de nuevo.',
      copiar: 'Copiar respuestas',
      copiado: 'Respuestas copiadas ✓',
      tentar: 'Intentar enviar de nuevo',
      linkCopiado: 'Enlace copiado. Pégalo en Safari o Chrome.'
    }
  };

  var ROTULOS = {
    sobrancelha: 'Design de Sobrancelha',
    depilacao: 'Depilação',
    limpeza: 'Limpeza de Pele',
    drenagem: 'Drenagem Linfática',
    desinflamacao: 'Tratamento de Dentro para Fora',
    gordura: 'Ativação Manual de Gordura Localizada',
    destravar: 'Destravamento Corporal Profundo'
  };

  /* ---------- Avisos dentro da página ---------- */
  function aviso(texto) {
    var box = $('avisoCS');
    if (!box) {
      box = document.createElement('div');
      box.id = 'avisoCS';
      box.setAttribute('role', 'alert');
      box.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:64px;z-index:300;' +
        'max-width:calc(100% - 32px);background:#2C2218;color:#F5F0E8;padding:14px 20px;border-radius:2px;' +
        'font-size:14px;line-height:1.5;box-shadow:0 6px 24px rgba(0,0,0,.2);text-align:center;display:none';
      document.body.appendChild(box);
    }
    box.textContent = texto;
    box.style.display = 'block';
    clearTimeout(box._t);
    box._t = setTimeout(function () { box.style.display = 'none'; }, 5000);
  }

  /* ---------- Copiar texto (com plano B para navegadores internos) ---------- */
  function copiar(texto, msgOk, campo) {
    var ok = function () { aviso(msgOk); };
    var plano = function () {
      var el = campo;
      if (!el) {
        el = document.createElement('textarea');
        el.value = texto;
        el.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(el);
      }
      el.select();
      try { el.setSelectionRange(0, 999999); } catch (e) {}
      try { if (document.execCommand('copy')) ok(); } catch (e) {}
      if (!campo) document.body.removeChild(el);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(ok, plano);
    } else {
      plano();
    }
  }

  /* ---------- Aviso do navegador interno (Instagram, Facebook, Line) ---------- */
  function avisoNavegadorInterno() {
    if (!/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|MicroMessenger/i.test(navigator.userAgent)) return;
    var b = document.createElement('div');
    b.style.cssText = 'background:#F5F0E8;border-bottom:1px solid #D4C5A9;padding:14px 20px;' +
      'text-align:center;font-size:13.5px;line-height:1.6;color:#7A5C3E';
    b.innerHTML =
      '<span data-lang="pt">Para enviar sua ficha com segurança, abra este link no <b>Safari</b> ou <b>Chrome</b>.</span>' +
      '<span data-lang="es">Para enviar tu ficha con seguridad, abre este enlace en <b>Safari</b> o <b>Chrome</b>.</span><br>' +
      '<button type="button" class="btn btn-ghost" style="margin-top:10px;padding:8px 18px">' +
      '<span data-lang="pt">Copiar link</span><span data-lang="es">Copiar enlace</span></button>';
    b.querySelector('button').addEventListener('click', function () {
      copiar(location.href, T[lang()].linkCopiado);
    });
    var w = $('welcomeBanner');
    if (w && w.parentNode) w.parentNode.insertBefore(b, w);
  }

  /* ---------- Listas: valor sempre em português ---------- */
  function fixarValoresDosSelects() {
    var opts = document.querySelectorAll('option[data-es]');
    for (var i = 0; i < opts.length; i++) {
      if (!opts[i].hasAttribute('value')) opts[i].setAttribute('value', opts[i].textContent.trim());
    }
  }

  /* ---------- Campos que faltavam: objetivo e conhec ---------- */
  function item(nome, valor, pt, es) {
    return '<label class="check-item"><input type="checkbox" name="' + nome + '" value="' + valor + '"> ' +
      '<span data-lang="pt">' + pt + '</span><span data-lang="es">' + es + '</span></label>';
  }

  function ativarMarcacao(raiz) {
    var inputs = raiz.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', function (e) {
        var lbl = e.target.closest('.check-item');
        if (lbl) lbl.classList.toggle('is-checked', e.target.checked);
      });
    }
  }

  function injetarCampos() {
    var alvo = $('expectativa');
    if (!alvo || $('cs-objetivo')) return;
    var grupo = alvo.closest('.field-group');
    if (!grupo) return;

    var html =
      '<div class="field-group" id="cs-objetivo">' +
        '<label><span data-lang="pt">Qual é o seu principal objetivo?</span><span data-lang="es">¿Cuál es tu principal objetivo?</span></label>' +
        '<div class="check-grid">' +
          item('objetivo', 'pele', 'Cuidar da pele do rosto', 'Cuidar la piel del rostro') +
          item('objetivo', 'desinflamar', 'Desinflamar e sentir o corpo mais leve', 'Desinflamar y sentir el cuerpo más liviano') +
          item('objetivo', 'contorno', 'Remodelar o contorno corporal', 'Remodelar el contorno corporal') +
          item('objetivo', 'relaxar', 'Relaxar e reduzir o estresse', 'Relajarme y reducir el estrés') +
          item('objetivo', 'beleza', 'Realçar a beleza (sobrancelhas, depilação)', 'Realzar la belleza (cejas, depilación)') +
          item('objetivo', 'rotina', 'Criar uma rotina de autocuidado', 'Crear una rutina de autocuidado') +
        '</div>' +
      '</div>' +
      '<div class="field-group" id="cs-conhec">' +
        '<label><span data-lang="pt">Você já conhece alguma destas abordagens?</span><span data-lang="es">¿Ya conoces alguno de estos enfoques?</span></label>' +
        '<div class="check-grid">' +
          item('conhec', 'ortomolecular', 'Terapia ortomolecular', 'Terapia ortomolecular') +
          item('conhec', 'drenagem', 'Drenagem linfática', 'Drenaje linfático') +
          item('conhec', 'orientais', 'Técnicas orientais', 'Técnicas orientales') +
          item('conhec', 'aromaterapia', 'Aromaterapia', 'Aromaterapia') +
          item('conhec', 'nenhuma', 'Ainda não conheço', 'Aún no conozco') +
        '</div>' +
      '</div>';

    grupo.insertAdjacentHTML('beforebegin', html);
    ativarMarcacao($('cs-objetivo'));
    ativarMarcacao($('cs-conhec'));
  }

  /* ---------- Coleta das respostas ---------- */
  function marcados(nome) {
    var els = document.querySelectorAll('input[name="' + nome + '"]:checked');
    var v = [].map.call(els, function (e) { return e.value; }).join(', ');
    return v || '—';
  }

  function valor(id) {
    var e = $(id);
    return e && e.value.trim() ? e.value.trim() : '—';
  }

  function tratamentos() {
    var cards = document.querySelectorAll('.treat-card.selected');
    var out = [].map.call(cards, function (c) { return ROTULOS[c.dataset.value] || c.dataset.value; });
    return out.length ? out.join(', ') : '—';
  }

  function coletar(assinatura, email) {
    var d = {
      'Idioma da ficha': lang() === 'es' ? 'Español' : 'Português',

      'Nome completo': valor('nome'),
      'Como prefere ser chamada': valor('apelido'),
      'Data de nascimento': valor('nascimento'),
      'Profissão': valor('profissao'),
      'Nacionalidade': valor('nacionalidade'),
      'WhatsApp': valor('whatsapp'),
      'Email': email || '—',
      'Cidade / País': valor('cidade'),
      'Modalidade': valor('modalidade'),
      'Como nos conheceu': marcados('origem'),

      'Tratamentos escolhidos': tratamentos(),

      'Condições de saúde': marcados('saude'),
      'Complemento saúde': valor('saudeObsv'),
      'Medicamentos': marcados('medic') + ' — ' + valor('medicamentos'),
      'Alergias': marcados('alergia') + ' — ' + valor('alergias'),
      'Gestante / Amamentando': marcados('gestante'),
      'Cirurgia recente': marcados('cirurgia') + ' — ' + valor('cirurgia'),

      'Ciclo menstrual': marcados('ciclo'),
      'Menarca (idade)': valor('menarca'),
      'Duração do ciclo (dias)': valor('cicloDias'),
      'Duração do fluxo (dias)': valor('fluxoDias'),
      'Intensidade do fluxo': valor('fluxoIntens'),
      'Sintomas do ciclo': marcados('cicloSint'),
      'Anticoncepcional / Reposição': marcados('hormonios'),

      'Peso (kg)': valor('peso'),
      'Altura (cm)': valor('altura'),
      'Ingestão de água': valor('agua'),

      'GLP-1': marcados('glp1'),
      'Medicamento GLP-1': marcados('glp1med') + ' ' + valor('glp1outro'),

      'Condição das sobrancelhas': marcados('sb-cond'),
      'Histórico design': marcados('sb-hist'),
      'Alergia henna': marcados('sb-henna'),
      'Objetivo sobrancelha': valor('sb-obsv'),

      'Método de depilação': marcados('dep-met'),
      'Sensibilidade depilação': marcados('dep-sens'),
      'Regiões depilação': marcados('dep-reg'),

      'Tipo de pele': valor('lp-tipopele'),
      'Tom de pele': valor('lp-tom'),
      'Queixas da pele': marcados('lp-queixa'),
      'Histórico limpeza de pele': marcados('lp-hist'),
      'Usa ácidos': marcados('lp-acidos') + ' — ' + valor('lp-acidos-desc'),
      'Protetor solar': marcados('lp-fps'),
      'Rotina manhã': valor('lp-manha'),
      'Rotina noturna': valor('lp-noite'),
      'Observações pele': valor('lp-obsv'),

      'Queixas corporais': marcados('corpo'),
      'Nível de estresse': marcados('estresse'),
      'Atividade física': valor('atividade'),
      'Tipo de exercício': valor('exercicio'),
      'Qualidade do sono': valor('sono'),
      'Alimentação': valor('alimentacao'),

      'Objetivos': marcados('objetivo'),
      'Expectativas': valor('expectativa'),
      'Abordagens conhecidas': marcados('conhec'),
      'Observações gerais': valor('obsv-geral'),

      'Autorização de imagem': marcados('imagem'),
      'Assinatura': assinatura,
      'Data de assinatura': valor('data-assinatura'),

      '_subject': 'Nova Ficha de Anamnese — ' + valor('nome')
    };
    // Só envia o campo de resposta se o e-mail existir e for válido
    if (email) d['_replyto'] = email;
    return d;
  }

  /* ---------- Resultado do envio ---------- */
  function mostrarSucesso() {
    var secoes = document.querySelectorAll('.form-section');
    for (var i = 0; i < secoes.length; i++) secoes[i].classList.remove('active');
    var p = $('progressBar'); if (p) p.style.display = 'none';
    var w = $('welcomeBanner'); if (w) w.style.display = 'none';
    $('successScreen').classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarFalha(dados) {
    var t = T[lang()];
    var linhas = Object.keys(dados)
      .filter(function (k) { return k.charAt(0) !== '_' && dados[k] && dados[k] !== '—'; })
      .map(function (k) { return k + ': ' + dados[k]; });
    var texto = 'Ficha de Anamnese — CS HADA 肌\n' + linhas.join('\n');

    var antigo = $('cs-falha'); if (antigo) antigo.remove();
    var div = document.createElement('div');
    div.id = 'cs-falha';
    div.className = 'note-box';
    div.style.marginTop = '24px';
    div.innerHTML =
      '<strong></strong><p style="margin:8px 0 12px"></p>' +
      '<textarea readonly style="min-height:140px;font-size:13px"></textarea>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">' +
      '<button type="button" class="btn btn-primary" data-a="copiar"></button>' +
      '<button type="button" class="btn btn-ghost" data-a="tentar"></button></div>';
    div.querySelector('strong').textContent = t.falhaTitulo;
    div.querySelector('p').textContent = t.falhaTexto;
    var ta = div.querySelector('textarea');
    ta.value = texto;
    div.querySelector('[data-a="copiar"]').textContent = t.copiar;
    div.querySelector('[data-a="tentar"]').textContent = t.tentar;
    div.querySelector('[data-a="copiar"]').addEventListener('click', function () { copiar(texto, t.copiado, ta); });
    div.querySelector('[data-a="tentar"]').addEventListener('click', function () { window.submitForm(); });
    $('section4').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- Etapa 1: validação ---------- */
  window.goToStep2 = function () {
    var t = T[lang()];
    if (!$('nome').value.trim()) return aviso(t.nome);
    if (!$('nascimento').value) return aviso(t.nascimento);
    if (!$('whatsapp').value.trim()) return aviso(t.whatsapp);
    var email = $('email').value.trim();
    if (email && !EMAIL.test(email)) return aviso(t.email);
    if (!$('modalidade').value) return aviso(t.modalidade);
    goTo('section2', 2);
  };

  /* ---------- Envio ---------- */
  window.submitForm = async function () {
    var t = T[lang()];
    if (!$('consentimento').checked) return aviso(t.consentimento);
    var assinatura = $('assinatura').value.trim();
    if (!assinatura) return aviso(t.assinatura);

    var email = $('email').value.trim();
    if (!EMAIL.test(email)) email = '';

    var btn = document.querySelector('.btn-sage');
    var falhaAnterior = $('cs-falha'); if (falhaAnterior) falhaAnterior.remove();
    btn.disabled = true;
    btn.textContent = t.enviando;

    var dados = coletar(assinatura, email);
    // FormData evita o "preflight" de CORS, que costuma falhar em navegadores internos
    var fd = new FormData();
    Object.keys(dados).forEach(function (k) { fd.append(k, dados[k]); });

    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 25000) : null;

    try {
      var r = await fetch(ENDPOINT, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' },
        signal: ctrl ? ctrl.signal : undefined
      });
      if (r.ok) { mostrarSucesso(); }
      else { mostrarFalha(dados); }
    } catch (e) {
      mostrarFalha(dados);
    } finally {
      if (timer) clearTimeout(timer);
      btn.disabled = false;
      btn.textContent = t.enviar;
    }
  };

  /* ---------- Início ---------- */
  function iniciar() {
    fixarValoresDosSelects();
    injetarCampos();
    avisoNavegadorInterno();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
