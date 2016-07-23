#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Simple Bot to reply to Telegram messages and especially photos, when it
# replies to photos, it should return a filtered version of the photo
# according to the the filters you have selected

"""
This Bot uses simple conditional responses to webhook messages.

Using a simple chain of if/else statements, we have built basic logic into
the bot to handle different commands. This bot runs on a flask server so
unless Heroku dies, it shall not.
"""

import requests
import json


r = requests.post(
    'https://api.kik.com/v1/config',
    auth=('livewellbot', 'd3c76643-953b-428b-b819-172dc2ded7b8'),
    headers={
        'Content-Type': 'application/json'
    },
    data=json.dumps({
        "webhook": "https://example.com/incoming",
        "features": {
            "manuallySendReadReceipts": False,
            "receiveReadReceipts": False,
            "receiveDeliveryReceipts": False,
            "receiveIsTyping": False
        }
    })
)

print(r)
