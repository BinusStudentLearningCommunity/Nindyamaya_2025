const db = require("../config/db");

/**
 * @desc    Fetch role-specific data for the home page
 * @route   GET /api/home
 * @access  Private (membutuhkan autentikasi)
 */
const getHomePageData = async (req, res) => {
  const { userID: userId } = req.user;

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
        .json({ message: "Terima kasih sudah login ke Nindyamaya. Mohon ditunggu untuk pairing dengan mentor." });
    }
    const role = userRoles[0].role;

    if (role === "mentor") {
      const [sessions] = await db.query(
        `SELECT session_id, course_name, platform, session_date as date, start_time, end_time 
                 FROM mentoringsession 
                 WHERE mentor_user_id = ? AND semester_id = ?
                 ORDER BY session_date DESC, start_time DESC
                 LIMIT 4`,
        [userId, activeSemesterId]
      );

      const [mentees] = await db.query(
        `SELECT u.user_id, u.name, u.email, u.faculty, u.profile_picture 
                 FROM user u
                 JOIN pairing p ON u.user_id = p.mentee_user_id
                 WHERE p.mentor_user_id = ? AND p.semester_id = ?`,
        [userId, activeSemesterId]
      );

      res.json({
        role: role,
        upcoming_sessions: sessions,
        my_mentees: mentees,
      });
    } else if (role === "mentee") {
      const [sessions] = await db.query(
        `SELECT m.session_id, m.course_name, m.platform, m.session_date as date, m.start_time, m.end_time 
                 FROM mentoringsession m
                 JOIN pairing p ON m.mentor_user_id = p.mentor_user_id
                 WHERE p.mentee_user_id = ? AND p.semester_id = ?
                 ORDER BY m.session_date DESC, m.start_time DESC
                 LIMIT 6`,
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
