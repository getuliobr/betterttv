import api from '../../utils/7tvapi.js';
import watcher from '../../watcher.js';
import settings from '../../settings.js';

import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.SEVENTV_GLOBAL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Global Emotes'}),
};

class SevenTVGlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateGlobalEmotes());

    this.updateGlobalEmotes();
  }

  get category() {
    return category;
  }

  upsertGlobalEmotes({id, owner, urls, name}) {
    this.emotes.set(
      name,
      new Emote({
        id,
        category: this.category,
        channel: owner.login || '7TV',
        code: name,
        images: {
          '1x': urls[0][1],
          '2x': urls[1][1],
          '4x': urls[3][1],
        },
        imageType: 'webp',
      })
    );
  }

  updateGlobalEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.STV_EMOTES)) return;

    api
      .get('emotes/global')
      .then((emotes) => emotes.forEach((emote) => this.upsertGlobalEmotes(emote)))
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTVGlobalEmotes();
