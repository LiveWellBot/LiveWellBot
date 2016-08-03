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
from StringIO import StringIO

buff = StringIO("")

url = "http://text-processing.com/api/sentiment/"
data = {"text": "great"}
files = buff
r = requests.post(url, data=data, stream=False, files=buff)
print(r.text)
json_response = json.loads(r.text)
print(json_response)
print(json_response['label'])
