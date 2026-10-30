-- 006g · El aviso de después de la visita lleva el enlace de reseña de Google del negocio (config.resenaUrl, se pone en Panel › Negocio y equipo).
-- Se aplica después de 006f. Solo reemplaza rv_texto.
create or replace function demo.rv_texto(p_cfg jsonb, p_r jsonb, p_tipo text) returns text language sql immutable set search_path = '' as $$
  select case p_tipo
    when 'confirmacion' then case when p_r->>'estado' = 'retenida' then 'Reservamos tu cupo por ' || coalesce(p_cfg->'politicas'->>'retencionMin', '10') || ' minutos. Paga el depósito para confirmar ' || (p_cfg->>'nombre') || ' (' || demo.rv_fechahora(p_cfg, p_r) || coalesce(' · ' || (p_r->>'unidadNombre'), '') || '). Código ' || (p_r->>'codigo') || '.'
      else 'Tu reserva en ' || (p_cfg->>'nombre') || ' está confirmada: ' || demo.rv_fechahora(p_cfg, p_r) || coalesce(' · ' || (p_r->>'unidadNombre'), '') || '. Código ' || (p_r->>'codigo') || '.' end
    when 'recordatorio' then 'Recordatorio: te esperamos en ' || (p_cfg->>'nombre') || ' el ' || demo.rv_fechahora(p_cfg, p_r) || coalesce(' (' || (p_r->>'unidadNombre') || ')', '') || '. Si no puedes venir, cancela desde tu enlace.'
    when 'resena' then '¿Cómo te fue en ' || (p_cfg->>'nombre') || '? ' || case when coalesce(p_cfg->>'resenaUrl', '') ~ '^https://' then 'Déjanos tu opinión en Google, nos ayuda mucho: ' || (p_cfg->>'resenaUrl') else 'Cuéntanos en 1 minuto.' end
    when 'cancelacion' then 'Tu reserva ' || (p_r->>'codigo') || ' en ' || (p_cfg->>'nombre') || ' fue cancelada.' || case when coalesce((p_r->'reembolso'->>'monto')::numeric, 0) > 0 then ' Te devolvemos ' || demo.rv_clp((p_r->'reembolso'->>'monto')::numeric) || '.' else '' end
    when 'espera' then 'Se liberó un cupo en ' || (p_cfg->>'nombre') || ' para la fecha que esperabas. Reserva antes que otro.'
    else '' end $$;
