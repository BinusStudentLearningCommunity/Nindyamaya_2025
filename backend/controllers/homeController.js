const db = require("../config/db");

/**
 * @desc    Fetch role-specific data for the home page
 * @route   GET /api/home
 * @access  Private (membutuhkan autentikasi)
 */
const getHomePageData = async (req, res) => {
  const { userId } = req.user;

  if (!userId) {
    return res
      .status(401)
      .json({
        message: "Akses tidak diizinkan, data pengguna tidak ditemukan.",
      });
  }

  try {
    // kalo libur, ngga masuk range semester aktif
    const [activeSemesters] = await db.query(
        `SELECT semester_id FROM semester WHERE NOW() BETWEEN start_date AND end_date LIMIT 1`
    );

    // ini tes buat semester 2 = semester aktif
    // const [activeSemesters] = await db.query(
    //   `SELECT semester_id FROM semester WHERE semester_id = 2 LIMIT 1`
    // );

    if (activeSemesters.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada semester yang sedang aktif saat ini." });
    }
    const activeSemesterId = activeSemesters[0].semester_id;

    const [userRoles] = await db.query(
      `SELECT role FROM userrole WHERE user_id = ? AND semester_id = ? LIMIT 1`,
      [userId, activeSemesterId]
    );

    if (userRoles.length === 0) {
      return res
        .status(403)
        .json({ message: "Role untuk semester aktif tidak ditemukan." });
    }
    const role = userRoles[0].role;

    if (role === "Mentor") {
      const [sessions] = await db.query(
        `SELECT session_id, course_name, platform, session_date as date, start_time, end_time 
                 FROM mentoringsession 
                 WHERE mentor_user_id = ? AND semester_id = ?
                 ORDER BY session_date ASC, start_time ASC`,
        [userId, activeSemesterId]
      );

      const [mentees] = await db.query(
        `SELECT u.user_id, u.name, u.email, u.phone, u.profile_picture 
                 FROM user u
                 JOIN pairing p ON u.user_id = p.mentee_user_id
                 WHERE p.mentor_user_id = ? AND p.semester_id = ?`,
        [userId, activeSemesterId]
      );

      res.json({
        role: "Mentor",
        upcoming_sessions: sessions,
        my_mentees: mentees,
      });
    } else if (role === "Member" || role === "Mentee") {
      const [sessions] = await db.query(
        `SELECT ms.session_id, ms.course_name, ms.platform, ms.session_date as date, ms.start_time, ms.end_time, u.name as mentor_name
                 FROM mentoringsession ms
                 JOIN mentoringsessionattendance msa ON ms.session_id = msa.session_id
                 JOIN user u ON ms.mentor_user_id = u.user_id
                 WHERE msa.mentee_user_id = ? AND ms.semester_id = ?
                 ORDER BY ms.session_date ASC, ms.start_time ASC`,
        [userId, activeSemesterId]
      );

      res.json({
        role: role,
        my_sessions: sessions,
      });
    } else {
      res
        .status(403)
        .json({
          message: "Role tidak dikenali, tidak ada data untuk ditampilkan.",
        });
    }
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  getHomePageData,
};
