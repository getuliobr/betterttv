import api from '../../utils/7tvapi.js';
import {getCurrentChannel} from '../../utils/channel.js';
import watcher from '../../watcher.js';
import {hasFlag} from '../../utils/flags.js';
import settings from '../../settings.js';

import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.SEVENTV_CHANNEL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Channel Emotes'}),
};

class SevenTVChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateChannelEmotes());
  }

  get category() {
    return category;
  }

  upsertChannelEmote({id, owner, urls, name}) {
    this.emotes.set(
      name,
      new Emote({
        id,
        category: this.category,
        channel: owner.login || getCurrentChannel(),
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

  updateChannelEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.STV_EMOTES)) return;

    const currentChannel = getCurrentChannel();
    if (!currentChannel) return;

    api
      .get(`users/${currentChannel.id}/emotes`)
      .catch((error) => ({
        emotes: [],
        status: error.status || 0,
      }))
      .then((emotes) => emotes.forEach((emote) => this.upsertChannelEmote(emote)))
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTVChannelEmotes();
