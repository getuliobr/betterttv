import $ from 'jquery';
import chat from '../chat/index.js';
import colors from '../../utils/colors.js';
import watcher from '../../watcher.js';
import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';
const CHAT_USERNAME_SELECTOR = 'a[href$="/clips"] span';
const SCROLL_INDICATOR_SELECTOR = '.clips-chat .clips-chat__content button';
const SCROLL_CONTAINER_SELECTOR = '.clips-chat .simplebar-scroll-content';

function scrollOnEmoteLoad($el) {
  const indicator = $(SCROLL_INDICATOR_SELECTOR).length > 0;
  if (indicator) return;
  $el.find('img').on('load', () => {
    const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
    if ($scrollContainer.length === 0) return;
    $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
  });
}

class ClipsModule {
  constructor() {
    watcher.on('clips.message', ($el) => this.parseMessage($el));
  }

  parseMessage($element) {
    const $from = $element.find(CHAT_USERNAME_SELECTOR);
    const $colorSpan = $from.closest('a').closest('span');

    if ($colorSpan.length && $colorSpan.css('color')) {
      const oldColor = colors.getHex(colors.getRgb($from.css('color')));
      $colorSpan.attr('style', `color: ${chat.calculateColor(oldColor)}`);
    }

    const mockUser = {name: $from.text()};
    chat.messageReplacer($element.find(CHAT_MESSAGE_SELECTOR), mockUser);

    scrollOnEmoteLoad($element);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH_CLIPS, () => new ClipsModule()]);
