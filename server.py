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

import telegram
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
from telegram import ForceReply, ReplyKeyboardMarkup, KeyboardButton
from flask import Flask, request, Response
import requests
import os
from PIL import Image, ImageFilter, ImageOps
import logging
import sendgrid
from firebase import firebase
import json
import re

from kik import KikApi, Configuration
from kik.messages import messages_from_json, TextMessage, PictureMessage

kik = KikApi(os.environ['KIK_BOT_USERNAME'], os.environ['KIK_BOT_API_KEY'])
kik.set_configuration(Configuration(webhook='https://damp-castle-40734.herokuapp.com/incoming'))

# Firebase is used to track user state and information
firebase_db = os.environ['FIREBASE_DB']
firebase = firebase.FirebaseApplication(firebase_db, None)

app = Flask(__name__)

global bot
bot = telegram.Bot(token=os.environ['TELEGRAM_KEY'])

filters = {
    'blur': ImageFilter.BLUR,
    'contour': ImageFilter.CONTOUR,
    'detail': ImageFilter.DETAIL,
    'edge_enhance': ImageFilter.EDGE_ENHANCE,
    'edge_enhance_more': ImageFilter.EDGE_ENHANCE_MORE,
    'emboss': ImageFilter.EMBOSS,
    'find_edges': ImageFilter.FIND_EDGES,
    'smooth': ImageFilter.SMOOTH,
    'smooth_more': ImageFilter.SMOOTH_MORE
}


@app.route('/incoming', methods=['POST'])
def incoming():
    if not kik.verify_signature(request.headers.get('X-Kik-Signature'), request.get_data()):
        return Response(status=403)

    messages = messages_from_json(request.json['messages'])

    for message in messages:
        current_state = None
        first_chat = None

        if isinstance(message, TextMessage):
            kik.send_messages([
                TextMessage(
                    to=message.from_user,
                    chat_id=message.chat_id,
                    body=message.body
                )
            ])
        elif isinstance(message, PictureMessage):
            current_state, first_chat = assign_state_first_chat(message.chat_id)
            if (current_state):
                kik.send_messages([
                    TextMessage(
                        to=message.from_user,
                        chat_id=message.chat_id,
                        body="current_state has been assigned"
                    )
                ])
            else:
                kik.send_messages([
                    TextMessage(
                        to=message.from_user,
                        chat_id=message.chat_id,
                        body="current_state is empty"
                    )
                ])
            kik.send_messages([
                TextMessage(
                    to=message.from_user,
                    chat_id=message.chat_id,
                    body="I have received an image"
                )
            ])

    return Response(status=200)


@app.route('/HOOK', methods=['POST'])
def webhook_handler():
    if request.method == "POST":
        # retrieve the message in JSON and then transform it to Telegram object
        update = telegram.Update.de_json(request.get_json(force=True))
        chat_id = update.message.chat.id

        current_state, first_chat = assign_state_first_chat(chat_id)

        # Telegram understands UTF-8, so encode text for unicode compatibility
        text = update.message.text.encode('utf-8')
        photo = update.message.photo

        if text:
            # text_array = text.split()
            print chat_id
            print text
            handle_text(text, update, current_state, chat_id, first_chat)
            # handle_command(text_array[0], update)
        elif photo:
            firebase_object, first_chat = check_for_first_chat(chat_id)
            filter_image(bot, update)
            print("first_chat???")
            print(first_chat)
            if first_chat is None:
                change_attribute(str(chat_id), "first_chat", True)
                change_attribute(str(chat_id), "state", "input_wake")
                full_message = ("It looks like this is your first time talking with"
                                "me! To help us give you a better idea of how you"
                                "are feeling from day to day, can you tell us when"
                                "You wake up?")
                bot.sendMessage(update.message.chat_id, text=full_message)
            else:
                change_attribute(str(chat_id), "first_chat", False)
                full_message = "How are you feeling today?"
                bot.sendMessage(update.message.chat_id, text=full_message)
    return 'ok'


# @app.route('/set_webhook', methods=['GET', 'POST'])
def set_webhook():
    s = bot.setWebhook('https://damp-castle-40734.herokuapp.com/HOOK')
    if s:
        return "telegram webhook setup ok"
    else:
        return "telegram webhook setup failed"

    r = requests.post(
        'https://api.kik.com/v1/config',
        auth=(os.environ['KIK_BOT_USERNAME'], os.environ['KIK_BOT_API_KEY']),
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


def change_attribute(subject, key, value):
    firebase.patch('/users/' + subject + '/', data={key: value})


def handle_text(text, update, current_state=None, chat_id=None, first_chat=None):
    if current_state == "input_wake":
        change_attribute(str(chat_id), "state", "input_sleep")
        change_attribute(str(chat_id), "time_wake", text)
        full_message = "What time do you usually go to sleep?"
        bot.sendMessage(update.message.chat_id, text=full_message)
    elif current_state == "input_sleep":
        change_attribute(str(chat_id), "state", "input_feeling")
        change_attribute(str(chat_id), "time_sleep", text)
        full_message = "How are you feeling today?"
        bot.sendMessage(update.message.chat_id, text=full_message)
    elif current_state == "input_feeling":
        change_attribute(str(chat_id), "state", "input_weight")
        change_attribute(str(chat_id), "feeling", text)
        full_message = "What's your weight today?"
        bot.sendMessage(update.message.chat_id, text=full_message)
    elif current_state == "input_weight":
        if "kg" in text:
            print("kg was selected")
            weight_number = re.sub("\D", "", text)
            weight_number = 2.20462 * float(weight_number)
            change_attribute(str(chat_id), "state", "input_memo")
            change_attribute(str(chat_id), "weight", str(weight_number))
            full_message = "Leave some comments on your photo!"
            bot.sendMessage(update.message.chat_id, text=full_message)
        elif "lb" in text:
            print("lb was selected")
            change_attribute(str(chat_id), "state", "input_memo")
            change_attribute(str(chat_id), "weight", re.sub("\D", "", text))
            full_message = "Leave some comments on your photo!"
            bot.sendMessage(update.message.chat_id, text=full_message)
        else:
            change_attribute(str(chat_id), "weight", re.sub("\D", "", text))
            change_attribute(str(chat_id), "state", "input_weight_unit")
            full_message = "is that in kg or lbs?"
            bot.sendMessage(update.message.chat_id, text=full_message)
    elif current_state == "input_weight_unit":
        if "kg" in text:
            print("kg was selected")
            firebase_object = firebase.get('/users/' + str(chat_id), None)
            weight_number = firebase_object.get('weight')
            weight_number = 2.20462 * float(weight_number)
            change_attribute(str(chat_id), "state", "input_memo")
            change_attribute(str(chat_id), "weight", str(weight_number))
            full_message = "Leave some comments on your photo!"
            bot.sendMessage(update.message.chat_id, text=full_message)
        elif "lb" in text:
            print("lb was selected")
            change_attribute(str(chat_id), "state", "input_memo")
            full_message = "Leave some comments on your photo!"
            bot.sendMessage(update.message.chat_id, text=full_message)
        else:
            full_message = "I didn't quite understand that, is that in kg or lbs?"
            bot.sendMessage(update.message.chat_id, text=full_message)
            return
    elif current_state == "input_memo":
        change_attribute(str(chat_id), "state", "input_tags")
        change_attribute(str(chat_id), "memo", text)
        full_message = "Leave some tags on this photo!"
        bot.sendMessage(update.message.chat_id, text=full_message)
    elif current_state == "input_tags":
        change_attribute(str(chat_id), "state", "complete")
        change_attribute(str(chat_id), "tags", text.split())
        try:
            payload = create_img_payload(chat_id)
        except Exception as e:
            print "firebase assignment failed"
            print str(e)
            file_id = 12345
            weight = 123
            feeling = "failed"
            memo = "failed again"
            tags = ["a", "b"]
            payload = {
                'file_id': file_id,
                'weight': weight,
                'feeling': feeling,
                'memo': memo,
                'tags': tags}
        r = requests.put("http://requestb.in/ukxanvuk",
                         data=json.dumps(payload))
        print(r.status_code, r.reason)
        full_message = "Great! Here is a link with all your photos."
        bot.sendMessage(update.message.chat_id, text=full_message)
    elif current_state == "/list_filters":
        bot.sendMessage(update.message.chat_id, text="potato")
    else:
        echo(bot, update)


def handle_command(command, update):
    if command == "/help":
        help(bot, update)
    elif command == "/list_filters":
        # list_filters(bot, update)
        print "hi"
    else:
        echo(bot, update)


def filter_image(bot, update):
    """
    Return images processed using the PIL and matplotlib libraries.

    This function should apply filters similar to Instagram and return images
    """
    chat_id = str(update.message.chat_id)
    file_id = update.message.photo[-1].file_id
    change_attribute(str(chat_id), "file_id", file_id)
    if not os.path.exists(chat_id):
        os.makedirs(chat_id)
    bot.getFile(file_id).download(chat_id+'/download.jpg')

    bot.sendPhoto(update.message.chat_id,
                  photo=open(chat_id+'/download.jpg', 'rb'),
                  caption=('This is just to make sure we properly received your image'))
    return


def create_img_payload(chat_id):
    firebase_dict = firebase.get('/users/' + str(chat_id), None)
    for k, v in firebase_dict.iteritems():
        key = k
        value = v
        if key == "file_id":
            file_id = value
        elif key == "weight":
            weight = value
        elif key == "feeling":
            feeling = value
        elif key == "memo":
            memo = value
        elif key == "tags":
            tags = value
    payload = {
        'file_id': file_id,
        'weight': weight,
        'feeling': feeling,
        'memo': memo,
        'tags': tags}
    return payload


def echo(bot, update):
    """
    Repeat any text message as this bot's default behavior.

    This function only serves the purpose of making sure the bot is activated
    """
    bot.sendMessage(update.message.chat_id, text=update.message.text)


@app.route('/')
def index():
    return '.'


def assign_state_first_chat(chat_id):
    current_state = None
    first_chat = None
    try:
        firebase_dict = firebase.get('/users/' + str(chat_id), None)
        for k, v in firebase_dict.iteritems():
            if k == "state":
                current_state = v
            elif k == "first_chat":
                first_chat = v
        print "THIS IS THE CURRENT STATE"
        print current_state
        print "THIS IS THE FIRST_CHAT STATUS"
        print first_chat
    except Exception as e:
        print "FAILURE TO ASSIGN STATE"
        print current_state
        print first_chat
        print str(e)
    return (current_state, first_chat)


def check_for_first_chat(chat_id):
    try:
        change_attribute(str(chat_id), "chat_id", str(chat_id))
        change_attribute(str(chat_id), "state", "input_feeling")
        firebase_object = firebase.get('/users/' + str(chat_id), None)
        first_chat = firebase_object.get('first_chat')
    except Exception as e:
        print str(e)
    return (firebase_object, first_chat)


if __name__ == "__main__":
    set_webhook()
