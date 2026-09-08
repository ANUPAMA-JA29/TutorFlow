# TutorFlow

> AI-powered tutoring management platform for one-to-one online tutors.

TutorFlow is a full-stack web application designed for tutors who manage individual students and tutoring sessions.

The platform allows tutors to:

- Manage student profiles
- Record learning goals, strengths, and weaknesses
- Schedule tutoring sessions
- Prevent tutor double-booking
- Track sessions through a controlled four-state lifecycle
- Start and complete sessions
- Write session notes and homework
- Generate personalized AI session plans
- Generate AI-powered session reviews
- Review student learning progress

Students have a restricted dashboard where they can see only:

- Their own upcoming sessions
- Their past sessions
- Session notes
- Homework
- AI-generated session reviews

---

## 🚀 Live Demo

**Live Application:**  
https://tutorflow.vercel.app

**GitHub Repository:**  
https://github.com/ANUPAMA-JA29/TutorFlow

---

# ✨ Features

## 1. Role-Based Authentication

TutorFlow supports two user roles:

### Tutor

Tutors can:

- Log in securely
- Add students
- Maintain student profiles
- Schedule sessions
- View all their sessions
- Start sessions
- Add notes
- Add homework
- Complete sessions
- Generate AI session plans
- Trigger AI reviews

### Student

Students can:

- Log in securely
- View only their own profile
- View upcoming sessions
- View past sessions
- Read session notes
- Read homework
- View AI-generated session reviews

Unauthorized users cannot access protected application data.

---

# 👩‍🏫 Tutor Features

## Student Management

Tutors can create student profiles containing:

- Name
- Email
- Age
- Subject
- Learning level
- Learning goals
- Strengths
- Weaknesses

This information is also used by the AI system to personalize session planning and review.

Example student profile:

```text
Name: Rahul
Subject: Mathematics
Learning Level: Intermediate

Learning Goals:
Improve algebra and problem-solving skills.

Strengths:
Good understanding of basic arithmetic.

Weaknesses:
Struggles with algebraic equations and word problems.
