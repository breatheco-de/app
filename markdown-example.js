/* eslint-disable no-tabs */
const markdownDefaultText = `
# About 4Geeks
Our goal is to empower talent with code by providing flexible educational experiences, we want to be the most relevant career-boosting community for future and present coders.

> Learn to code with [4Geeks Academy](https://4geeksacademy.co)

## Why coding?

Embracing the world of coding opens a new world of opportunities for talents, from Web Development to Blockchain, Robotics or AI/Machine Learning.

<onlyfor permission="read_private_lesson">
  
# Hello World
This content was blocked

  - \`read_private_lesson\`
  - user account
  - role access
</onlyfor>

## Cornerstones :+1:

- Content
- Community
- Collaboration
- Support

<before-after
  before="https://ca-times.brightspotcdn.com/dims4/default/c3f4b96/2147483647/strip/true/crop/1970x1108+39+0/resize/1200x675!/quality/80/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F12%2Fa5%2F79e097ccf62312d18a025f22ce48%2Fhoyla-recuento-11-cosas-aman-gatos-top-001"
  after="https://www.thesprucepets.com/thmb/ac8-PKFO6U6I6rF52bPlJDD1onM=/1471x980/filters:fill(auto,1)/GettyImages-1288261359-4016b054680e41d28451f081babd0c45.jpg"
/>

# Loooooong code block
\`\`\`py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Client(db.Model):
	client_id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(50))
	phone = db.Column(db.Integer)

class Order(db.Model):
	order_id = db.Column(db.Integer, primary_key=True)
	client_id = db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id')
	invoice = db.Column(db.Integer)

results = db.session.query(Order, Client).outerjoin(Client, full=True).all()

#Printing the results:
for client, order in results:
	print(client.name, order.order_id)
\`\`\`
`;
export default markdownDefaultText;
