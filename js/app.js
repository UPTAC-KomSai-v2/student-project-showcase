const showcase = document.getElementById("showcase");
const courseNav = document.getElementById("courseNav");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");

let courses = [];

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");

    if (!response.ok) {
      throw new Error("Could not load projects.json");
    }

    const data = await response.json();
    courses = data.courses;

    renderNavigation(courses);
    renderCourseFilter(courses);
    renderShowcase(courses);
  } catch (error) {
    showcase.innerHTML = `
      <p style="color: #fca5a5; text-align: center;">
        Failed to load project data. Check data/projects.json.
      </p>
    `;
    console.error(error);
  }
}

function renderNavigation(courses) {
  courseNav.innerHTML = courses
    .map(course => `<a href="#${course.id}">${escapeHTML(course.id.toUpperCase())}</a>`)
    .join("");
}

function renderCourseFilter(courses) {
  courses.forEach(course => {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = course.title;
    courseFilter.appendChild(option);
  });
}

function renderShowcase(coursesToRender) {
  showcase.innerHTML = coursesToRender
    .map(course => createCourseSection(course))
    .join("");
}

function createCourseSection(course) {
  const projectCards = course.projects
    .map(project => createProjectCard(project, course))
    .join("");

  return `
    <section id="${escapeHTML(course.id)}" class="course-section" data-course="${escapeHTML(course.id)}">
      <div class="course-header">
        <h2>${escapeHTML(course.title)}</h2>
        <p>${escapeHTML(course.description)}</p>
      </div>

      <div class="project-grid">
        ${projectCards}
      </div>
    </section>
  `;
}

function createProjectCard(project, course) {
  const tags = project.tags
    .map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
    .join("");

  const media = createMedia(project);

  const demoLink = project.demo && project.demo !== "#"
    ? `<a href="${escapeAttribute(project.demo)}" target="_blank" rel="noopener">Demo</a>`
    : "";

  const repoLink = project.repository && project.repository !== "#"
    ? `<a href="${escapeAttribute(project.repository)}" target="_blank" rel="noopener">Repository</a>`
    : "";

  return `
    <article class="project-card"
      data-course="${escapeHTML(course.id)}"
      data-search="${escapeAttribute([
        course.title,
        project.title,
        project.type,
        project.description,
        ...(project.tags || [])
      ].join(" ").toLowerCase())}"
    >
      ${media}

      <div class="project-content">
        <h3>${escapeHTML(project.title)}</h3>
        <div class="meta">${escapeHTML(course.id.toUpperCase())} · ${escapeHTML(project.type)}</div>

        <p>${escapeHTML(project.description)}</p>

        <div class="tags">${tags}</div>

        <div class="links">
          ${demoLink}
          ${repoLink}
        </div>
      </div>
    </article>
  `;
}

function createMedia(project) {
  const altText = `${project.title} media`;

  if (project.mediaType === "video") {
    const poster = project.poster ? `poster="${escapeAttribute(project.poster)}"` : "";

    return `
      <video controls ${poster}>
        <source src="${escapeAttribute(project.media)}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }

  return `<img src="${escapeAttribute(project.media)}" alt="${escapeAttribute(altText)}">`;
}

function filterProjects() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCourse = courseFilter.value;

  const filteredCourses = courses
    .filter(course => selectedCourse === "all" || course.id === selectedCourse)
    .map(course => {
      const filteredProjects = course.projects.filter(project => {
        const searchableText = [
          course.title,
          project.title,
          project.type,
          project.description,
          ...(project.tags || [])
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
      });

      return {
        ...course,
        projects: filteredProjects
      };
    })
    .filter(course => course.projects.length > 0);

  renderShowcase(filteredCourses);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

searchInput.addEventListener("input", filterProjects);
courseFilter.addEventListener("change", filterProjects);

loadProjects();