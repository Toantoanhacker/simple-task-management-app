

# **App lập kế hoạch thiết kế app cho nhóm 3**

**Các chức năng chính:**

> **File images cho UI của project:** chi tiết hình ảnh cho UI của project

> **Công nghệ sử dụng:** Vibe coding & Half Human Coding and debuging AI code

---

* Template source: **[Full EMR (Electronic Medical Records)](https://drapcode.com/templates/electronic-medical-records-emr)**

---

## Logs

---

### Back-end version RELEASE 1.0 Sep 16 2025 10:27PM
- add synch checkbox for fun
- add option to delte the image if needed
- fixed the delete function not work

---

### Back-end version snapshot3 Sep 16 2025 at 8:00PM
**HASTA LA VISTA BUG BABIES FINALY**

- in db add one more column within the `person` table which is `tag_color` and set the default value to `#cccccc`
- add person tags which you can add or remove a person in a project
- add a function which you can assign a person to do a section with the image
- fixed the bug where the tag color doesnt set properly
- fixed a bug where you cant assigh person into an image section
- db connect completed
- fix add images not work bug
- fix the lightbox bug
- add zoom in/out and panning for each lightbox

---

### Back-end version snapshot2 Sep 16 2025 at 6:58PM
- since the backend styling looks sh*t, merge the previous front end version
- fix grid view mode

---

### Back-end version snapshot1 Sep 16 2025 at 6:28PM
- successfuly connected to postgres
- add option to track front end and back end complete or not
- moving to a more modern version to import lib for db
- config policies for the table `person`, `images`, `assignments` for public use
- config the storage policies Allow public uploads and view

---

### Front-end version prototype done on Sep 16 2025 at 4:40PM
- fix various bug and display issues
- populate the image hard-coded into the html file
- ready for the next phase with the completed front end stuff

---