import type { ComponentType } from "react";
import type { TocEntry } from "@/components/Toc";
import { ALL_ITEMS } from "./nav";

import * as cli from "./pages/cli";
import * as components_activity_timeline from "./pages/components/activity-timeline";
import * as components_app_shell from "./pages/components/app-shell";
import * as components_avatar from "./pages/components/avatar";
import * as components_badge from "./pages/components/badge";
import * as components_button from "./pages/components/button";
import * as components_command_palette from "./pages/components/command-palette";
import * as components_confirm_dialog from "./pages/components/confirm-dialog";
import * as components_dialog from "./pages/components/dialog";
import * as components_editable_text from "./pages/components/editable-text";
import * as components_field from "./pages/components/field";
import * as components_heatmap from "./pages/components/heatmap";
import * as components_hotkeys_help from "./pages/components/hotkeys-help";
import * as components_live_indicator from "./pages/components/live-indicator";
import * as components_markdown from "./pages/components/markdown";
import * as components_mention_textarea from "./pages/components/mention-textarea";
import * as components_menu from "./pages/components/menu";
import * as components_misc from "./pages/components/misc";
import * as components_query_input from "./pages/components/query-input";
import * as components_section_nav from "./pages/components/section-nav";
import * as components_slash_textarea from "./pages/components/slash-textarea";
import * as components_sparkline from "./pages/components/sparkline";
import * as components_status_bar from "./pages/components/status-bar";
import * as components_tag_input from "./pages/components/tag-input";
import * as components_theme_toggle from "./pages/components/theme-toggle";
import * as components_time_range from "./pages/components/time-range";
import * as components_tooltip from "./pages/components/tooltip";
import * as components_undo_toaster from "./pages/components/undo-toaster";
import * as components_virtual_list from "./pages/components/virtual-list";
import * as hooks_use_active_section from "./pages/hooks/use-active-section";
import * as hooks_use_dismiss from "./pages/hooks/use-dismiss";
import * as hooks_use_drag_scroll from "./pages/hooks/use-drag-scroll";
import * as hooks_use_event_stream from "./pages/hooks/use-event-stream";
import * as hooks_use_hotkeys from "./pages/hooks/use-hotkeys";
import * as hooks_use_polling from "./pages/hooks/use-polling";
import * as hooks_use_theme from "./pages/hooks/use-theme";
import * as installation from "./pages/installation";
import * as introduction from "./pages/introduction";
import * as theming from "./pages/theming";
import * as widgets_dashboard_grid from "./pages/widgets/dashboard-grid";
import * as widgets_dep_graph from "./pages/widgets/dep-graph";
import * as widgets_diff_view from "./pages/widgets/diff-view";
import * as widgets_filter_bar from "./pages/widgets/filter-bar";
import * as widgets_flow_canvas from "./pages/widgets/flow-canvas";
import * as widgets_gantt from "./pages/widgets/gantt";
import * as widgets_kanban from "./pages/widgets/kanban";
import * as widgets_log_stream from "./pages/widgets/log-stream";
import * as widgets_presence_layer from "./pages/widgets/presence-layer";
import * as widgets_tree_view from "./pages/widgets/tree-view";

/** Модуль страницы: оглавление и сама разметка. */
export interface DocModule {
  toc: TocEntry[];
  default: ComponentType;
}

/**
 * Все страницы документации по их slug.
 *
 * Файл собирается скриптом `node scripts/gen-pages.mjs` — не правьте руками.
 * Импорты статические, а не динамические по имени файла: так недостающая
 * страница ломает сборку, а не превращается в 404 у пользователя.
 */
export const PAGES: Record<string, DocModule> = {
  "cli": cli,
  "components/activity-timeline": components_activity_timeline,
  "components/app-shell": components_app_shell,
  "components/avatar": components_avatar,
  "components/badge": components_badge,
  "components/button": components_button,
  "components/command-palette": components_command_palette,
  "components/confirm-dialog": components_confirm_dialog,
  "components/dialog": components_dialog,
  "components/editable-text": components_editable_text,
  "components/field": components_field,
  "components/heatmap": components_heatmap,
  "components/hotkeys-help": components_hotkeys_help,
  "components/live-indicator": components_live_indicator,
  "components/markdown": components_markdown,
  "components/mention-textarea": components_mention_textarea,
  "components/menu": components_menu,
  "components/misc": components_misc,
  "components/query-input": components_query_input,
  "components/section-nav": components_section_nav,
  "components/slash-textarea": components_slash_textarea,
  "components/sparkline": components_sparkline,
  "components/status-bar": components_status_bar,
  "components/tag-input": components_tag_input,
  "components/theme-toggle": components_theme_toggle,
  "components/time-range": components_time_range,
  "components/tooltip": components_tooltip,
  "components/undo-toaster": components_undo_toaster,
  "components/virtual-list": components_virtual_list,
  "hooks/use-active-section": hooks_use_active_section,
  "hooks/use-dismiss": hooks_use_dismiss,
  "hooks/use-drag-scroll": hooks_use_drag_scroll,
  "hooks/use-event-stream": hooks_use_event_stream,
  "hooks/use-hotkeys": hooks_use_hotkeys,
  "hooks/use-polling": hooks_use_polling,
  "hooks/use-theme": hooks_use_theme,
  "installation": installation,
  "introduction": introduction,
  "theming": theming,
  "widgets/dashboard-grid": widgets_dashboard_grid,
  "widgets/dep-graph": widgets_dep_graph,
  "widgets/diff-view": widgets_diff_view,
  "widgets/filter-bar": widgets_filter_bar,
  "widgets/flow-canvas": widgets_flow_canvas,
  "widgets/gantt": widgets_gantt,
  "widgets/kanban": widgets_kanban,
  "widgets/log-stream": widgets_log_stream,
  "widgets/presence-layer": widgets_presence_layer,
  "widgets/tree-view": widgets_tree_view,
};

/**
 * Навигация и набор страниц должны совпадать. Пункт меню, ведущий в никуда,
 * иначе обнаруживается только кликом.
 */
const missing = ALL_ITEMS.filter((item) => !PAGES[item.slug]).map((item) => item.slug);
const orphans = Object.keys(PAGES).filter((slug) => !ALL_ITEMS.some((i) => i.slug === slug));

if (missing.length > 0 || orphans.length > 0) {
  const details = [
    missing.length > 0 ? `нет страниц: ${missing.join(", ")}` : "",
    orphans.length > 0 ? `страницы вне меню: ${orphans.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  throw new Error(`Навигация и страницы разошлись — ${details}`);
}
