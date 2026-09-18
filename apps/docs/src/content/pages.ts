import type { ComponentType } from "react";
import type { TocEntry } from "@/components/Toc";
import { ALL_ITEMS } from "./nav";
import { LANGS, type Lang } from "./locale";

import * as en_cli from "./pages/en/cli";
import * as en_components_activity_timeline from "./pages/en/components/activity-timeline";
import * as en_components_app_shell from "./pages/en/components/app-shell";
import * as en_components_avatar from "./pages/en/components/avatar";
import * as en_components_badge from "./pages/en/components/badge";
import * as en_components_button from "./pages/en/components/button";
import * as en_components_command_palette from "./pages/en/components/command-palette";
import * as en_components_confirm_dialog from "./pages/en/components/confirm-dialog";
import * as en_components_dialog from "./pages/en/components/dialog";
import * as en_components_editable_text from "./pages/en/components/editable-text";
import * as en_components_field from "./pages/en/components/field";
import * as en_components_heatmap from "./pages/en/components/heatmap";
import * as en_components_hotkeys_help from "./pages/en/components/hotkeys-help";
import * as en_components_live_indicator from "./pages/en/components/live-indicator";
import * as en_components_markdown from "./pages/en/components/markdown";
import * as en_components_mention_textarea from "./pages/en/components/mention-textarea";
import * as en_components_menu from "./pages/en/components/menu";
import * as en_components_misc from "./pages/en/components/misc";
import * as en_components_query_input from "./pages/en/components/query-input";
import * as en_components_section_nav from "./pages/en/components/section-nav";
import * as en_components_slash_textarea from "./pages/en/components/slash-textarea";
import * as en_components_sparkline from "./pages/en/components/sparkline";
import * as en_components_status_bar from "./pages/en/components/status-bar";
import * as en_components_tag_input from "./pages/en/components/tag-input";
import * as en_components_theme_toggle from "./pages/en/components/theme-toggle";
import * as en_components_time_range from "./pages/en/components/time-range";
import * as en_components_tooltip from "./pages/en/components/tooltip";
import * as en_components_undo_toaster from "./pages/en/components/undo-toaster";
import * as en_components_virtual_list from "./pages/en/components/virtual-list";
import * as en_hooks_use_active_section from "./pages/en/hooks/use-active-section";
import * as en_hooks_use_dismiss from "./pages/en/hooks/use-dismiss";
import * as en_hooks_use_drag_scroll from "./pages/en/hooks/use-drag-scroll";
import * as en_hooks_use_event_stream from "./pages/en/hooks/use-event-stream";
import * as en_hooks_use_hotkeys from "./pages/en/hooks/use-hotkeys";
import * as en_hooks_use_polling from "./pages/en/hooks/use-polling";
import * as en_hooks_use_theme from "./pages/en/hooks/use-theme";
import * as en_installation from "./pages/en/installation";
import * as en_introduction from "./pages/en/introduction";
import * as en_theming from "./pages/en/theming";
import * as en_widgets_dashboard_grid from "./pages/en/widgets/dashboard-grid";
import * as en_widgets_dep_graph from "./pages/en/widgets/dep-graph";
import * as en_widgets_diff_view from "./pages/en/widgets/diff-view";
import * as en_widgets_filter_bar from "./pages/en/widgets/filter-bar";
import * as en_widgets_flow_canvas from "./pages/en/widgets/flow-canvas";
import * as en_widgets_gantt from "./pages/en/widgets/gantt";
import * as en_widgets_kanban from "./pages/en/widgets/kanban";
import * as en_widgets_log_stream from "./pages/en/widgets/log-stream";
import * as en_widgets_presence_layer from "./pages/en/widgets/presence-layer";
import * as en_widgets_tree_view from "./pages/en/widgets/tree-view";
import * as ru_cli from "./pages/ru/cli";
import * as ru_components_activity_timeline from "./pages/ru/components/activity-timeline";
import * as ru_components_app_shell from "./pages/ru/components/app-shell";
import * as ru_components_avatar from "./pages/ru/components/avatar";
import * as ru_components_badge from "./pages/ru/components/badge";
import * as ru_components_button from "./pages/ru/components/button";
import * as ru_components_command_palette from "./pages/ru/components/command-palette";
import * as ru_components_confirm_dialog from "./pages/ru/components/confirm-dialog";
import * as ru_components_dialog from "./pages/ru/components/dialog";
import * as ru_components_editable_text from "./pages/ru/components/editable-text";
import * as ru_components_field from "./pages/ru/components/field";
import * as ru_components_heatmap from "./pages/ru/components/heatmap";
import * as ru_components_hotkeys_help from "./pages/ru/components/hotkeys-help";
import * as ru_components_live_indicator from "./pages/ru/components/live-indicator";
import * as ru_components_markdown from "./pages/ru/components/markdown";
import * as ru_components_mention_textarea from "./pages/ru/components/mention-textarea";
import * as ru_components_menu from "./pages/ru/components/menu";
import * as ru_components_misc from "./pages/ru/components/misc";
import * as ru_components_query_input from "./pages/ru/components/query-input";
import * as ru_components_section_nav from "./pages/ru/components/section-nav";
import * as ru_components_slash_textarea from "./pages/ru/components/slash-textarea";
import * as ru_components_sparkline from "./pages/ru/components/sparkline";
import * as ru_components_status_bar from "./pages/ru/components/status-bar";
import * as ru_components_tag_input from "./pages/ru/components/tag-input";
import * as ru_components_theme_toggle from "./pages/ru/components/theme-toggle";
import * as ru_components_time_range from "./pages/ru/components/time-range";
import * as ru_components_tooltip from "./pages/ru/components/tooltip";
import * as ru_components_undo_toaster from "./pages/ru/components/undo-toaster";
import * as ru_components_virtual_list from "./pages/ru/components/virtual-list";
import * as ru_hooks_use_active_section from "./pages/ru/hooks/use-active-section";
import * as ru_hooks_use_dismiss from "./pages/ru/hooks/use-dismiss";
import * as ru_hooks_use_drag_scroll from "./pages/ru/hooks/use-drag-scroll";
import * as ru_hooks_use_event_stream from "./pages/ru/hooks/use-event-stream";
import * as ru_hooks_use_hotkeys from "./pages/ru/hooks/use-hotkeys";
import * as ru_hooks_use_polling from "./pages/ru/hooks/use-polling";
import * as ru_hooks_use_theme from "./pages/ru/hooks/use-theme";
import * as ru_installation from "./pages/ru/installation";
import * as ru_introduction from "./pages/ru/introduction";
import * as ru_theming from "./pages/ru/theming";
import * as ru_widgets_dashboard_grid from "./pages/ru/widgets/dashboard-grid";
import * as ru_widgets_dep_graph from "./pages/ru/widgets/dep-graph";
import * as ru_widgets_diff_view from "./pages/ru/widgets/diff-view";
import * as ru_widgets_filter_bar from "./pages/ru/widgets/filter-bar";
import * as ru_widgets_flow_canvas from "./pages/ru/widgets/flow-canvas";
import * as ru_widgets_gantt from "./pages/ru/widgets/gantt";
import * as ru_widgets_kanban from "./pages/ru/widgets/kanban";
import * as ru_widgets_log_stream from "./pages/ru/widgets/log-stream";
import * as ru_widgets_presence_layer from "./pages/ru/widgets/presence-layer";
import * as ru_widgets_tree_view from "./pages/ru/widgets/tree-view";

/** Модуль страницы: оглавление и сама разметка. */
export interface DocModule {
  toc: TocEntry[];
  default: ComponentType;
}

/**
 * Все страницы документации по языку и slug.
 *
 * Файл собирается скриптом `node scripts/gen-pages.mjs` — не правьте руками.
 * Импорты статические, а не динамические по имени файла: так недостающая
 * страница ломает сборку, а не превращается в 404 у пользователя.
 */
export const PAGES: Record<Lang, Record<string, DocModule>> = {
  en: {
    "cli": en_cli,
    "components/activity-timeline": en_components_activity_timeline,
    "components/app-shell": en_components_app_shell,
    "components/avatar": en_components_avatar,
    "components/badge": en_components_badge,
    "components/button": en_components_button,
    "components/command-palette": en_components_command_palette,
    "components/confirm-dialog": en_components_confirm_dialog,
    "components/dialog": en_components_dialog,
    "components/editable-text": en_components_editable_text,
    "components/field": en_components_field,
    "components/heatmap": en_components_heatmap,
    "components/hotkeys-help": en_components_hotkeys_help,
    "components/live-indicator": en_components_live_indicator,
    "components/markdown": en_components_markdown,
    "components/mention-textarea": en_components_mention_textarea,
    "components/menu": en_components_menu,
    "components/misc": en_components_misc,
    "components/query-input": en_components_query_input,
    "components/section-nav": en_components_section_nav,
    "components/slash-textarea": en_components_slash_textarea,
    "components/sparkline": en_components_sparkline,
    "components/status-bar": en_components_status_bar,
    "components/tag-input": en_components_tag_input,
    "components/theme-toggle": en_components_theme_toggle,
    "components/time-range": en_components_time_range,
    "components/tooltip": en_components_tooltip,
    "components/undo-toaster": en_components_undo_toaster,
    "components/virtual-list": en_components_virtual_list,
    "hooks/use-active-section": en_hooks_use_active_section,
    "hooks/use-dismiss": en_hooks_use_dismiss,
    "hooks/use-drag-scroll": en_hooks_use_drag_scroll,
    "hooks/use-event-stream": en_hooks_use_event_stream,
    "hooks/use-hotkeys": en_hooks_use_hotkeys,
    "hooks/use-polling": en_hooks_use_polling,
    "hooks/use-theme": en_hooks_use_theme,
    "installation": en_installation,
    "introduction": en_introduction,
    "theming": en_theming,
    "widgets/dashboard-grid": en_widgets_dashboard_grid,
    "widgets/dep-graph": en_widgets_dep_graph,
    "widgets/diff-view": en_widgets_diff_view,
    "widgets/filter-bar": en_widgets_filter_bar,
    "widgets/flow-canvas": en_widgets_flow_canvas,
    "widgets/gantt": en_widgets_gantt,
    "widgets/kanban": en_widgets_kanban,
    "widgets/log-stream": en_widgets_log_stream,
    "widgets/presence-layer": en_widgets_presence_layer,
    "widgets/tree-view": en_widgets_tree_view,
  },
  ru: {
    "cli": ru_cli,
    "components/activity-timeline": ru_components_activity_timeline,
    "components/app-shell": ru_components_app_shell,
    "components/avatar": ru_components_avatar,
    "components/badge": ru_components_badge,
    "components/button": ru_components_button,
    "components/command-palette": ru_components_command_palette,
    "components/confirm-dialog": ru_components_confirm_dialog,
    "components/dialog": ru_components_dialog,
    "components/editable-text": ru_components_editable_text,
    "components/field": ru_components_field,
    "components/heatmap": ru_components_heatmap,
    "components/hotkeys-help": ru_components_hotkeys_help,
    "components/live-indicator": ru_components_live_indicator,
    "components/markdown": ru_components_markdown,
    "components/mention-textarea": ru_components_mention_textarea,
    "components/menu": ru_components_menu,
    "components/misc": ru_components_misc,
    "components/query-input": ru_components_query_input,
    "components/section-nav": ru_components_section_nav,
    "components/slash-textarea": ru_components_slash_textarea,
    "components/sparkline": ru_components_sparkline,
    "components/status-bar": ru_components_status_bar,
    "components/tag-input": ru_components_tag_input,
    "components/theme-toggle": ru_components_theme_toggle,
    "components/time-range": ru_components_time_range,
    "components/tooltip": ru_components_tooltip,
    "components/undo-toaster": ru_components_undo_toaster,
    "components/virtual-list": ru_components_virtual_list,
    "hooks/use-active-section": ru_hooks_use_active_section,
    "hooks/use-dismiss": ru_hooks_use_dismiss,
    "hooks/use-drag-scroll": ru_hooks_use_drag_scroll,
    "hooks/use-event-stream": ru_hooks_use_event_stream,
    "hooks/use-hotkeys": ru_hooks_use_hotkeys,
    "hooks/use-polling": ru_hooks_use_polling,
    "hooks/use-theme": ru_hooks_use_theme,
    "installation": ru_installation,
    "introduction": ru_introduction,
    "theming": ru_theming,
    "widgets/dashboard-grid": ru_widgets_dashboard_grid,
    "widgets/dep-graph": ru_widgets_dep_graph,
    "widgets/diff-view": ru_widgets_diff_view,
    "widgets/filter-bar": ru_widgets_filter_bar,
    "widgets/flow-canvas": ru_widgets_flow_canvas,
    "widgets/gantt": ru_widgets_gantt,
    "widgets/kanban": ru_widgets_kanban,
    "widgets/log-stream": ru_widgets_log_stream,
    "widgets/presence-layer": ru_widgets_presence_layer,
    "widgets/tree-view": ru_widgets_tree_view,
  },
};

/**
 * Навигация и набор страниц должны совпадать — на каждом языке.
 *
 * Пункт меню, ведущий в никуда, иначе обнаруживается только кликом; страница
 * без пункта — вообще никак. Проверка идёт по всем языкам сразу, поэтому
 * перевод, забытый на одном из них, роняет сборку, а не выкатывается наружу
 * пустым разделом.
 */
const problems: string[] = [];

for (const lang of LANGS) {
  const pages = PAGES[lang] ?? {};
  const missing = ALL_ITEMS.filter((item) => !pages[item.slug]).map((item) => item.slug);
  const orphans = Object.keys(pages).filter((slug) => !ALL_ITEMS.some((i) => i.slug === slug));

  if (missing.length > 0) problems.push(`[${lang}] нет страниц: ${missing.join(", ")}`);
  if (orphans.length > 0) problems.push(`[${lang}] страницы вне меню: ${orphans.join(", ")}`);
}

if (problems.length > 0) {
  throw new Error(`Навигация и страницы разошлись — ${problems.join("; ")}`);
}
